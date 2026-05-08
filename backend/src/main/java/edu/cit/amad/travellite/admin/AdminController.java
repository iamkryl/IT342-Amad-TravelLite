package edu.cit.amad.travellite.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", adminService.getDashboard());
        response.put("error", null);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", adminService.getAllUsers());
        response.put("error", null);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/users/{userId}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> suspendUser(@PathVariable Long userId) {
        adminService.suspendUser(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", "User suspended successfully");
        response.put("error", null);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/users/{userId}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reactivateUser(@PathVariable Long userId) {
        adminService.reactivateUser(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", "User reactivated successfully");
        response.put("error", null);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", "User deleted successfully");
        response.put("error", null);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trips")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTrips() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", adminService.getAllTrips());
        response.put("error", null);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trips/{tripId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTripById(@PathVariable Integer tripId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", adminService.getTripById(tripId));
        response.put("error", null);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/trips/{tripId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTrip(@PathVariable Integer tripId) {
        adminService.deleteTrip(tripId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", "Trip deleted successfully");
        response.put("error", null);
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}