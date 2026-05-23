package com.placeguess.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rounds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    // Actual Street View location
    @Column(name = "actual_lat", nullable = false)
    private Double actualLat;

    @Column(name = "actual_lng", nullable = false)
    private Double actualLng;

    @Column(name = "location_name")
    private String locationName;

    // Player's guess
    @Column(name = "guessed_lat")
    private Double guessedLat;

    @Column(name = "guessed_lng")
    private Double guessedLng;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "score")
    private Integer score;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
}
