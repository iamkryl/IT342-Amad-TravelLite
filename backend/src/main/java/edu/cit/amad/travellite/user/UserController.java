package edu.cit.amad.travellite.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse profile = userService.getProfile(userDetails.getUsername());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", profile);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        UserProfileResponse profile = userService.updateProfile(userDetails.getUsername(), request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", profile);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/photo")
    public ResponseEntity<?> uploadPhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("photo") MultipartFile file) throws IOException {
        UserProfileResponse profile = userService.uploadPhoto(userDetails.getUsername(), file);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", profile);
        response.put("error", null);
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}