package com.cloudbite.service;

import com.cloudbite.dto.LocationResponseDto;
import com.cloudbite.model.Order;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DeliveryLocationService {

    private record LatLng(double lat, double lng) {}
    private record RiderLive(double lat, double lng, Double heading, Double speed, long ts) {}

    private final Map<Long, List<double[]>> routeMap = new ConcurrentHashMap<>();
    private final Map<Long, Integer> stepMap = new ConcurrentHashMap<>();
    private final Map<Long, LatLng> kitchenGeo = new ConcurrentHashMap<>();
    private final Map<Long, LatLng> customerGeo = new ConcurrentHashMap<>();
    private final Map<Long, RiderLive> liveLocationMap = new ConcurrentHashMap<>();

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void updateLiveLocation(Long orderId, double lat, double lng, Double heading, Double speed) {
        liveLocationMap.put(orderId, new RiderLive(lat, lng, heading, speed, System.currentTimeMillis()));
    }

    public LocationResponseDto getSimulatedLocation(Order order) {
        Long orderId = order.getId();

        String kitchenAddr = kitchenAddress(order);
        String customerAddr = customerAddress(order);

        LatLng kitchen = kitchenGeo.computeIfAbsent(orderId, id -> {
            LatLng g = geocode(kitchenAddr);
            return g != null ? g : fallbackByLocality(kitchenAddr);
        });

        LatLng customer = customerGeo.computeIfAbsent(orderId, id -> {
            LatLng g = geocode(customerAddr);
            return g != null ? g : fallbackByLocality(customerAddr);
        });

        if (kitchen == null || customer == null) {
            throw new RuntimeException("Unable to resolve route points for order " + orderId);
        }

        String kitchenName = order.getKitchen() != null ? order.getKitchen().getName() : "Outlet";
        String custName = (order.getCustomer() != null && order.getCustomer().getUser() != null)
                ? order.getCustomer().getUser().getFullName()
                : "Customer";

        // 1) Prefer true live rider GPS when available
        RiderLive live = liveLocationMap.get(orderId);
        if (live != null) {
            double remainingKm = haversineKm(live.lat(), live.lng(), customer.lat(), customer.lng());
            double totalKm = Math.max(0.2, haversineKm(kitchen.lat(), kitchen.lng(), customer.lat(), customer.lng()));
            int totalSteps = 100;
            int currentStep = (int) Math.max(0, Math.min(100, Math.round((1.0 - (remainingKm / totalKm)) * 100.0)));
            boolean arrived = remainingKm <= 0.05; // 50m

            return new LocationResponseDto(
                    live.lat(), live.lng(), arrived,
                    kitchen.lat(), kitchen.lng(), kitchenName, kitchenAddr,
                    customer.lat(), customer.lng(), custName, customerAddr,
                    currentStep, totalSteps
            );
        }

        // 2) Fallback simulation (used when partner GPS updates are not available yet)
        List<double[]> route = routeMap.computeIfAbsent(orderId, id -> {
            stepMap.put(id, 0);
            List<double[]> generated = fetchOsrmRoute(kitchen.lat(), kitchen.lng(), customer.lat(), customer.lng());
            if (generated == null || generated.size() < 2) {
                generated = buildStraightRoute(kitchen.lat(), kitchen.lng(), customer.lat(), customer.lng());
            }
            return generated;
        });

        if (route.size() < 2 || haversineKm(kitchen.lat(), kitchen.lng(), customer.lat(), customer.lng()) < 0.15) {
            double offset = 0.01;
            route = buildStraightRoute(kitchen.lat(), kitchen.lng(), customer.lat() + offset, customer.lng() + offset);
            routeMap.put(orderId, route);
            stepMap.put(orderId, 0);
        }

        int totalSteps = route.size() - 1;
        int currentStep = Math.min(stepMap.getOrDefault(orderId, 0), totalSteps);
        stepMap.put(orderId, currentStep + 1);

        double[] point = route.get(currentStep);
        double lat = point[0] + (Math.random() - 0.5) * 0.00006;
        double lng = point[1] + (Math.random() - 0.5) * 0.00006;
        boolean arrived = totalSteps > 0 && currentStep >= totalSteps;

        return new LocationResponseDto(
                lat, lng, arrived,
                kitchen.lat(), kitchen.lng(), kitchenName, kitchenAddr,
                customer.lat(), customer.lng(), custName, customerAddr,
                currentStep, totalSteps
        );
    }

    public void startSimulation(Order order) {
        Long orderId = order.getId();
        stepMap.put(orderId, 0);
        routeMap.remove(orderId);
        kitchenGeo.remove(orderId);
        customerGeo.remove(orderId);
        liveLocationMap.remove(orderId);
    }

    public void stopSimulation(Long orderId) {
        stepMap.remove(orderId);
        routeMap.remove(orderId);
        kitchenGeo.remove(orderId);
        customerGeo.remove(orderId);
        liveLocationMap.remove(orderId);
    }

    private String kitchenAddress(Order order) {
        if (order.getKitchen() != null && order.getKitchen().getAddress() != null) {
            return order.getKitchen().getAddress();
        }
        return "Mumbai, India";
    }

    private String customerAddress(Order order) {
        if (order.getDeliveryAddress() != null && !order.getDeliveryAddress().isBlank()) {
            return order.getDeliveryAddress();
        }

        if (order.getCustomer() != null) {
            String addr = order.getCustomer().getAddress();
            String place = order.getCustomer().getPlace();
            String postal = order.getCustomer().getPostalCode();
            if (addr != null) {
                return addr + (place != null ? ", " + place : "")
                        + (postal != null ? " - " + postal : "");
            }
        }

        return "Mumbai, India";
    }

    private LatLng geocode(String address) {
        List<String> queries = List.of(
                address,
                address + ", Mumbai, Maharashtra, India",
                address + ", India"
        );

        for (String q : queries) {
            try {
                String encoded = URLEncoder.encode(q, StandardCharsets.UTF_8);
                String url = "https://nominatim.openstreetmap.org/search"
                        + "?q=" + encoded
                        + "&format=json&limit=1&countrycodes=in";

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("User-Agent", "CloudBite-DeliveryTracker/1.0")
                        .GET()
                        .build();

                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                JsonNode arr = objectMapper.readTree(resp.body());

                if (arr.isArray() && arr.size() > 0) {
                    double lat = arr.get(0).path("lat").asDouble();
                    double lng = arr.get(0).path("lon").asDouble();
                    return new LatLng(lat, lng);
                }
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    private LatLng fallbackByLocality(String address) {
        if (address == null) return new LatLng(19.0760, 72.8777);
        String a = address.toLowerCase();

        if (a.contains("borivali")) return new LatLng(19.2307, 72.8567);
        if (a.contains("kandivali")) return new LatLng(19.2058, 72.8501);
        if (a.contains("malad")) return new LatLng(19.1867, 72.8486);
        if (a.contains("andheri")) return new LatLng(19.1136, 72.8697);
        if (a.contains("bandra")) return new LatLng(19.0596, 72.8295);
        if (a.contains("ghatkopar")) return new LatLng(19.0856, 72.9082);
        if (a.contains("mulund")) return new LatLng(19.1726, 72.9560);
        if (a.contains("thane")) return new LatLng(19.2183, 72.9781);
        if (a.contains("vikhroli")) return new LatLng(19.1115, 72.9289);
        if (a.contains("powai")) return new LatLng(19.1176, 72.9060);

        return new LatLng(19.0760, 72.8777);
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double EARTH_RADIUS_KM = 6371.0;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double sinLat = Math.sin(dLat / 2);
        double sinLon = Math.sin(dLon / 2);

        double a = sinLat * sinLat
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * sinLon * sinLon;

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS_KM * c;
    }

    private List<double[]> fetchOsrmRoute(double startLat, double startLng,
                                          double endLat, double endLng) {
        try {
            String url = String.format(
                    "https://router.project-osrm.org/route/v1/driving/%.6f,%.6f;%.6f,%.6f"
                            + "?overview=full&geometries=geojson&steps=false",
                    startLng, startLat, endLng, endLat
            );

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(resp.body());
            JsonNode routes = root.path("routes");
            if (!routes.isArray() || routes.size() == 0) {
                return buildStraightRoute(startLat, startLng, endLat, endLng);
            }

            JsonNode coords = routes.get(0).path("geometry").path("coordinates");
            List<double[]> waypoints = new ArrayList<>();
            for (JsonNode c : coords) {
                waypoints.add(new double[]{c.get(1).asDouble(), c.get(0).asDouble()});
            }
            return sampleWaypoints(waypoints, 60);
        } catch (Exception e) {
            return buildStraightRoute(startLat, startLng, endLat, endLng);
        }
    }

    private List<double[]> sampleWaypoints(List<double[]> all, int target) {
        if (all.size() <= target) return all;
        List<double[]> sampled = new ArrayList<>();
        double step = (double) (all.size() - 1) / (target - 1);
        for (int i = 0; i < target; i++) {
            sampled.add(all.get((int) Math.round(i * step)));
        }
        return sampled;
    }

    private List<double[]> buildStraightRoute(double sLat, double sLng,
                                              double eLat, double eLng) {
        List<double[]> route = new ArrayList<>();
        for (int i = 0; i <= 60; i++) {
            double p = (double) i / 60;
            route.add(new double[]{sLat + (eLat - sLat) * p, sLng + (eLng - sLng) * p});
        }
        return route;
    }
}
