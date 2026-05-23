package com.placeguess.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameResponse {
    private Long gameId;
    private String status;
    private Integer totalScore;
    private Integer currentRound;
    private Integer totalRounds;
    private LocalDateTime createdAt;

    // Current round info
    private RoundResponse currentRoundData;
}
