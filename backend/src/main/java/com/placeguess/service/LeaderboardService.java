package com.placeguess.service;

import com.placeguess.dto.response.LeaderboardEntry;
import com.placeguess.entity.User;
import com.placeguess.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;

    private static final int DEFAULT_LIMIT = 10;

    @Cacheable(value = "leaderboard", key = "#limit")
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getTopPlayers(int limit) {
        AtomicInteger rank = new AtomicInteger(1);

        Pageable pageable = PageRequest.of(0, limit);
        return userRepository.findTopUsersByTotalScore(pageable)
                .stream()
                .map(user -> toEntry(user, rank.getAndIncrement()))
                .toList();
    }

    @Cacheable(value = "leaderboard", key = "'default'")
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getTopPlayers() {
        return getTopPlayers(DEFAULT_LIMIT);
    }

    @CacheEvict(value = "leaderboard", allEntries = true)
    public void evictLeaderboardCache() {
        // Called after a game is completed to refresh the cache
    }

    private LeaderboardEntry toEntry(User user, int rank) {
        long totalScore = user.getTotalScore() != null ? user.getTotalScore() : 0L;
        int gamesPlayed = user.getGamesPlayed() != null ? user.getGamesPlayed() : 0;

        double avg = gamesPlayed > 0
                ? (double) totalScore / gamesPlayed
                : 0.0;

        return LeaderboardEntry.builder()
                .rank(rank)
                .userId(user.getId())
                .username(user.getUsername())
                .totalScore(totalScore)
                .gamesPlayed(gamesPlayed)
                .averageScore(Math.round(avg * 10.0) / 10.0)
                .build();
    }
}
