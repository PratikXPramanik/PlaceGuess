package com.placeguess.util;

import lombok.Getter;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Random;

@Component
public class StreetViewLocationProvider {

    public static final int DEFAULT_HEADING = 0;
    public static final int DEFAULT_PITCH = 0;
    public static final int DEFAULT_FOV = 90;

    private static final Random RANDOM = new Random();

    @Getter
    public static class Location {
        private final double lat;
        private final double lng;
        private final String name;

        public Location(double lat, double lng, String name) {
            this.lat = lat;
            this.lng = lng;
            this.name = name;
        }
    }

    // Curated list of Street View-available world locations
    private static final List<Location> LOCATIONS = List.of(
        new Location(48.8584, 2.2945, "Eiffel Tower, Paris, France"),
        new Location(51.5007, -0.1246, "Big Ben, London, UK"),
        new Location(40.6892, -74.0445, "Statue of Liberty, New York, USA"),
        new Location(-33.8568, 151.2153, "Sydney Opera House, Australia"),
        new Location(27.1751, 78.0421, "Taj Mahal, Agra, India"),
        new Location(37.8199, -122.4783, "Golden Gate Bridge, San Francisco, USA"),
        new Location(35.6586, 139.7454, "Tokyo Tower, Japan"),
        new Location(41.8902, 12.4922, "Colosseum, Rome, Italy"),
        new Location(-13.1631, -72.5450, "Machu Picchu, Peru"),
        new Location(29.9792, 31.1342, "Pyramids of Giza, Egypt"),
        new Location(55.7516, 37.6176, "Red Square, Moscow, Russia"),
        new Location(-22.9519, -43.2105, "Christ the Redeemer, Brazil"),
        new Location(48.1486, 17.1077, "Bratislava, Slovakia"),
        new Location(59.9139, 10.7522, "Oslo, Norway"),
        new Location(-36.8485, 174.7633, "Auckland, New Zealand"),
        new Location(1.2966, 103.8536, "Marina Bay Sands, Singapore"),
        new Location(25.1972, 55.2744, "Burj Khalifa, Dubai, UAE"),
        new Location(19.4326, -99.1332, "Mexico City, Mexico"),
        new Location(-34.6037, -58.3816, "Buenos Aires, Argentina"),
        new Location(52.3676, 4.9041, "Amsterdam, Netherlands"),
        new Location(41.0082, 28.9784, "Istanbul, Turkey"),
        new Location(13.7563, 100.5018, "Bangkok, Thailand"),
        new Location(-1.2921, 36.8219, "Nairobi, Kenya"),
        new Location(55.6761, 12.5683, "Copenhagen, Denmark"),
        new Location(43.7696, 11.2558, "Florence, Italy"),
        new Location(37.9838, 23.7275, "Athens, Greece"),
        new Location(47.3769, 8.5417, "Zurich, Switzerland"),
        new Location(50.0755, 14.4378, "Prague, Czech Republic"),
        new Location(52.2297, 21.0122, "Warsaw, Poland"),
        new Location(-26.2041, 28.0473, "Johannesburg, South Africa")
    );

    /**
     * Returns a random location from the curated list.
     */
    public Location getRandomLocation() {
        return LOCATIONS.get(RANDOM.nextInt(LOCATIONS.size()));
    }

    /**
     * Builds the Google Street View Static API URL for a given location.
     */
    public String buildStreetViewUrl(double lat, double lng, String apiKey) {
        return buildStreetViewUri(lat, lng, DEFAULT_HEADING, DEFAULT_PITCH, DEFAULT_FOV, apiKey).toString();
    }

    public URI buildStreetViewUri(double lat, double lng, int heading, int pitch, int fov, String apiKey) {
        String location = String.format("%f,%f", lat, lng);
        String query = "size=800x450"
                + "&location=" + URLEncoder.encode(location, StandardCharsets.UTF_8)
                + "&fov=" + clamp(fov, 10, 120)
                + "&heading=" + normalizeHeading(heading)
                + "&pitch=" + clamp(pitch, -90, 90)
                + "&key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
        return URI.create("https://maps.googleapis.com/maps/api/streetview?" + query);
    }

    private int normalizeHeading(int heading) {
        int normalized = heading % 360;
        return normalized < 0 ? normalized + 360 : normalized;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
