package com.placeguess.controller;

import com.placeguess.dto.request.GuessRequest;
import com.placeguess.dto.response.GameResponse;
import com.placeguess.dto.response.RoundResponse;
import com.placeguess.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /**
     * POST /api/games/start
     * Start a new 5-round game.
     */
    @PostMapping("/start")
    public ResponseEntity<GameResponse> startGame(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in before starting a game");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gameService.startGame(userDetails.getUsername()));
    }

    /**
     * GET /api/games/{gameId}/round
     * Fetch the current unanswered round for a game.
     */
    @GetMapping("/{gameId}/round")
    public ResponseEntity<GameResponse> getCurrentRound(
            @PathVariable Long gameId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in before loading a game");
        }

        return ResponseEntity.ok(gameService.getCurrentRound(gameId, userDetails.getUsername()));
    }

    /**
     * POST /api/games/guess
     * Submit a lat/lng guess for the current round.
     */
    @PostMapping("/guess")
    public ResponseEntity<RoundResponse> submitGuess(
            @Valid @RequestBody GuessRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in before submitting a guess");
        }

        return ResponseEntity.ok(gameService.submitGuess(request, userDetails.getUsername()));
    }

    @GetMapping(value = "/rounds/{roundId}/street-view", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getStreetViewImage(
            @PathVariable Long roundId,
            @RequestParam(defaultValue = "0") int heading,
            @RequestParam(defaultValue = "0") int pitch,
            @RequestParam(defaultValue = "90") int fov) {
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(gameService.getStreetViewImage(roundId, heading, pitch, fov));
    }

    /**
     * GET /api/games/history
     * Retrieve the authenticated user's game history.
     */
    @GetMapping("/history")
    public ResponseEntity<List<GameResponse>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in before viewing game history");
        }

        return ResponseEntity.ok(gameService.getGameHistory(userDetails.getUsername()));
    }
}
