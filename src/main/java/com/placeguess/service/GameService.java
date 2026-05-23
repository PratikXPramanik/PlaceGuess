package com.placeguess.service;

import com.placeguess.dto.request.GuessRequest;
import com.placeguess.dto.response.GameResponse;
import com.placeguess.dto.response.RoundResponse;
import com.placeguess.entity.Game;
import com.placeguess.entity.Round;
import com.placeguess.entity.User;
import com.placeguess.exception.GameException;
import com.placeguess.exception.ResourceNotFoundException;
import com.placeguess.repository.GameRepository;
import com.placeguess.repository.RoundRepository;
import com.placeguess.repository.UserRepository;
import com.placeguess.util.GeoCalculator;
import com.placeguess.util.StreetViewLocationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final RoundRepository roundRepository;
    private final UserRepository userRepository;
    private final GeoCalculator geoCalculator;
    private final StreetViewLocationProvider locationProvider;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.google.maps.api-key}")
    private String googleApiKey;

    @Value("${app.game.rounds-per-game}")
    private int roundsPerGame;

    // ── Start a new game ──────────────────────────────────────────────────────

    @Transactional
    public GameResponse startGame(String username) {
        User user = findUser(username);

        // Abandon any existing in-progress game
        gameRepository.findActiveGamesByUserId(user.getId())
                .forEach(g -> {
                    g.setStatus(Game.GameStatus.ABANDONED);
                    gameRepository.save(g);
                });

        Game game = Game.builder()
                .user(user)
                .status(Game.GameStatus.IN_PROGRESS)
                .build();
        game = gameRepository.save(game);

        // Create the first round
        Round firstRound = createRound(game, 1);

        return buildGameResponse(game, firstRound, false);
    }

    // ── Get current round ─────────────────────────────────────────────────────

    @Transactional
    public GameResponse getCurrentRound(Long gameId, String username) {
        User user = findUser(username);
        Game game = findGame(gameId, user.getId());

        if (game.getStatus() != Game.GameStatus.IN_PROGRESS) {
            throw new GameException("Game is not in progress");
        }

        Round round = roundRepository
                .findFirstByGameIdAndAnsweredAtIsNullOrderByRoundNumber(gameId)
                .orElseGet(() -> createRound(game,
                        (int) roundRepository.countByGameId(gameId) + 1));

        return buildGameResponse(game, round, false);
    }

    // ── Submit a guess ────────────────────────────────────────────────────────

    @Transactional
    public RoundResponse submitGuess(GuessRequest request, String username) {
        User user = findUser(username);
        Game game = findGame(request.getGameId(), user.getId());

        if (game.getStatus() != Game.GameStatus.IN_PROGRESS) {
            throw new GameException("Game is not in progress");
        }

        Round round = roundRepository
                .findByGameIdAndRoundNumber(request.getGameId(), request.getRoundNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Round " + request.getRoundNumber() + " not found"));

        if (round.getGuessedLat() != null) {
            throw new GameException("This round has already been answered");
        }

        // Calculate distance & score
        double distance = geoCalculator.calculateDistance(
                round.getActualLat(), round.getActualLng(),
                request.getGuessedLat(), request.getGuessedLng()
        );
        int score = geoCalculator.calculateScore(distance);

        round.setGuessedLat(request.getGuessedLat());
        round.setGuessedLng(request.getGuessedLng());
        round.setDistanceKm(distance);
        round.setScore(score);
        round.setTimeTakenSeconds(request.getTimeTakenSeconds());
        round.setAnsweredAt(LocalDateTime.now());
        roundRepository.save(round);

        // Update game total score
        game.setTotalScore(game.getTotalScore() + score);

        // Check if game is over
        long answeredRounds = roundRepository.countByGameIdAndAnsweredAtIsNotNull(game.getId());
        if (answeredRounds >= roundsPerGame) {
            finalizeGame(game, user);
        } else {
            // Pre-create the next round
            createRound(game, request.getRoundNumber() + 1);
        }

        gameRepository.save(game);

        return buildRoundResponse(round, true);
    }

    // ── Get game history ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GameResponse> getGameHistory(String username) {
        User user = findUser(username);
        return gameRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(g -> GameResponse.builder()
                        .gameId(g.getId())
                        .status(g.getStatus().name())
                        .totalScore(g.getTotalScore())
                        .totalRounds(roundsPerGame)
                        .createdAt(g.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public byte[] getStreetViewImage(Long roundId, int heading, int pitch, int fov) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round not found: " + roundId));

        HttpRequest request = HttpRequest.newBuilder(locationProvider.buildStreetViewUri(
                        round.getActualLat(), round.getActualLng(), heading, pitch, fov, googleApiKey))
                .GET()
                .build();

        try {
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() >= 400) {
                throw new GameException("Unable to load Street View image. Check that the Street View Static API is enabled for your key.");
            }
            return response.body();
        } catch (IOException ex) {
            throw new GameException("Unable to connect to Google Street View");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new GameException("Street View image request was interrupted");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Round createRound(Game game, int roundNumber) {
        StreetViewLocationProvider.Location loc = locationProvider.getRandomLocation();
        Round round = Round.builder()
                .game(game)
                .roundNumber(roundNumber)
                .actualLat(loc.getLat())
                .actualLng(loc.getLng())
                .locationName(loc.getName())
                .build();
        return roundRepository.save(round);
    }

    private void finalizeGame(Game game, User user) {
        game.setStatus(Game.GameStatus.COMPLETED);
        game.setCompletedAt(LocalDateTime.now());

        user.setTotalScore(user.getTotalScore() + game.getTotalScore());
        user.setGamesPlayed(user.getGamesPlayed() + 1);
        userRepository.save(user);
    }

    private GameResponse buildGameResponse(Game game, Round round, boolean revealLocation) {
        return GameResponse.builder()
                .gameId(game.getId())
                .status(game.getStatus().name())
                .totalScore(game.getTotalScore())
                .currentRound(round.getRoundNumber())
                .totalRounds(roundsPerGame)
                .createdAt(game.getCreatedAt())
                .currentRoundData(buildRoundResponse(round, revealLocation))
                .build();
    }

    private RoundResponse buildRoundResponse(Round round, boolean revealLocation) {
        RoundResponse.RoundResponseBuilder builder = RoundResponse.builder()
                .roundId(round.getId())
                .roundNumber(round.getRoundNumber())
                .streetViewUrl(buildStreetViewProxyUrl(round.getId()))
                .streetViewDirectUrl(locationProvider.buildStreetViewUrl(
                        round.getActualLat(), round.getActualLng(), googleApiKey));

        if (revealLocation) {
            builder.actualLat(round.getActualLat())
                    .actualLng(round.getActualLng())
                    .locationName(round.getLocationName())
                    .guessedLat(round.getGuessedLat())
                    .guessedLng(round.getGuessedLng())
                    .distanceKm(round.getDistanceKm())
                    .score(round.getScore())
                    .timeTakenSeconds(round.getTimeTakenSeconds());
        }

        return builder.build();
    }

    private String buildStreetViewProxyUrl(Long roundId) {
        try {
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/games/rounds/{roundId}/street-view")
                    .buildAndExpand(roundId)
                    .toUriString();
        } catch (IllegalStateException ex) {
            return "/api/games/rounds/" + roundId + "/street-view";
        }
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private Game findGame(Long gameId, Long userId) {
        return gameRepository.findByIdAndUserId(gameId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found: " + gameId));
    }
}
