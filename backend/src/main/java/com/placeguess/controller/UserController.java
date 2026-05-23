package com.placeguess.controller;

import com.placeguess.dto.response.LeaderboardEntry;
import com.placeguess.entity.User;
import com.placeguess.exception.ResourceNotFoundException;
import com.placeguess.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * GET /api/users/me
     * Returns the authenticated user's profile and stats.
     */
    @GetMapping("/me")
    public ResponseEntity<LeaderboardEntry> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        double avg = user.getGamesPlayed() > 0
                ? (double) user.getTotalScore() / user.getGamesPlayed()
                : 0.0;

        return ResponseEntity.ok(LeaderboardEntry.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .totalScore(user.getTotalScore())
                .gamesPlayed(user.getGamesPlayed())
                .averageScore(Math.round(avg * 10.0) / 10.0)
                .build());
    }
}
