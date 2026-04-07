package edu.cit.amad.travellite.controller;

import edu.cit.amad.travellite.adapter.WeatherAdapter;
import edu.cit.amad.travellite.dto.DashboardResponse;
import edu.cit.amad.travellite.dto.TripRequest;
import edu.cit.amad.travellite.dto.TripResponse;
import edu.cit.amad.travellite.dto.WeatherResponse;
import edu.cit.amad.travellite.entity.User;
import edu.cit.amad.travellite.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import edu.cit.amad.travellite.repository.UserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000")
public class TripController {

    @Autowired private TripService tripService;
    @Autowired private UserRepository userRepository;
    @Autowired private WeatherAdapter weatherAdapter;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getUserId();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        DashboardResponse dashboard = tripService.getDashboard(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", dashboard);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trips")
    public ResponseEntity<?> getAllTrips(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<TripResponse> trips = tripService.getAllTrips(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", trips);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trips/upcoming")
    public ResponseEntity<?> getUpcomingTrips(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<TripResponse> trips = tripService.getUpcomingTrips(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", trips);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trips/{id}")
    public ResponseEntity<?> getTripById(@PathVariable Integer id) {
        TripResponse trip = tripService.getTripById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", trip);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/trips")
    public ResponseEntity<?> createTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TripRequest request) {
        Long userId = getUserId(userDetails);
        TripResponse trip = tripService.createTrip(userId, request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", trip);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/trips/{id}")
    public ResponseEntity<?> updateTrip(
            @PathVariable Integer id,
            @RequestBody TripRequest request) {
        TripResponse trip = tripService.updateTrip(id, request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", trip);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/trips/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable Integer id) {
        tripService.deleteTrip(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", null);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trips/{id}/weather")
    public ResponseEntity<?> getWeather(@PathVariable Integer id) {
        TripResponse trip = tripService.getTripById(id);
        WeatherResponse weather = weatherAdapter.getWeather(trip.getDestination());
        Map<String, Object> response = new HashMap<>();
        response.put("success", weather != null);
        response.put("data", weather);
        response.put("error", weather == null
                ? Map.of("message", "Weather information unavailable") : null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}