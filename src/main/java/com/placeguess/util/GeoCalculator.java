package com.placeguess.util;

import org.springframework.stereotype.Component;

@Component
public class GeoCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double MAX_DISTANCE_KM = 5000.0;
    private static final int MAX_SCORE = 5000;

    /**
     * Calculates the great-circle distance between two coordinates using the Haversine formula.
     */
    public double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Calculates score based on distance.
     * Score decays exponentially: 5000 pts at 0 km → 0 pts at 5000 km.
     */
    public int calculateScore(double distanceKm) {
        if (distanceKm >= MAX_DISTANCE_KM) return 0;
        // Exponential decay scoring (mirrors GeoGuessr's formula)
        double score = MAX_SCORE * Math.pow(Math.E, -10.0 * distanceKm / MAX_DISTANCE_KM);
        return (int) Math.round(score);
    }
}
