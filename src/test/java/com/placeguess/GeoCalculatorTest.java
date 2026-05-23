package com.placeguess;

import com.placeguess.util.GeoCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeoCalculatorTest {

    private GeoCalculator geoCalculator;

    @BeforeEach
    void setUp() {
        geoCalculator = new GeoCalculator();
    }

    @Test
    @DisplayName("Distance between same point should be 0")
    void testZeroDistance() {
        double dist = geoCalculator.calculateDistance(48.8584, 2.2945, 48.8584, 2.2945);
        assertEquals(0.0, dist, 0.01);
    }

    @Test
    @DisplayName("Paris to London distance should be ~341 km")
    void testParisToLondon() {
        double dist = geoCalculator.calculateDistance(48.8584, 2.2945, 51.5007, -0.1246);
        assertTrue(dist > 330 && dist < 350, "Expected ~341 km, got " + dist);
    }

    @Test
    @DisplayName("Score at 0 km should be 5000")
    void testMaxScore() {
        int score = geoCalculator.calculateScore(0.0);
        assertEquals(5000, score);
    }

    @Test
    @DisplayName("Score at 5000 km should be 0")
    void testMinScore() {
        int score = geoCalculator.calculateScore(5000.0);
        assertEquals(0, score);
    }

    @Test
    @DisplayName("Score at 100 km should be positive and < 5000")
    void testMidScore() {
        int score = geoCalculator.calculateScore(100.0);
        assertTrue(score > 0 && score < 5000);
    }

    @Test
    @DisplayName("Score should decay as distance increases")
    void testScoreDecay() {
        int score100 = geoCalculator.calculateScore(100.0);
        int score500 = geoCalculator.calculateScore(500.0);
        int score2000 = geoCalculator.calculateScore(2000.0);
        assertTrue(score100 > score500);
        assertTrue(score500 > score2000);
    }
}
