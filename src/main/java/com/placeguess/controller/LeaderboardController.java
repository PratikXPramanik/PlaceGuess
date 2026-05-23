package com.placeguess.controller;

import com.placeguess.dto.response.LeaderboardEntry;
import com.placeguess.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    /**
     * GET /api/leaderboard
     * Public endpoint — returns top 10 players by total score (Redis cached).
     */
    @GetMapping
    public ResponseEntity<List<LeaderboardEntry>> getTopPlayers(
            @RequestParam(defaultValue = "10") int limit) {
        if (limit < 1 || limit > 100) limit = 10;
        return ResponseEntity.ok(leaderboardService.getTopPlayers(limit));
    }
}
