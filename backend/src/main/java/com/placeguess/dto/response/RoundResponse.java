package com.placeguess.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoundResponse {
    private Long roundId;
    private Integer roundNumber;
    private String streetViewUrl;
    private String streetViewDirectUrl;

    // Populated only after guess is submitted
    private Double actualLat;
    private Double actualLng;
    private String locationName;
    private Double guessedLat;
    private Double guessedLng;
    private Double distanceKm;
    private Integer score;
    private Integer timeTakenSeconds;
}
