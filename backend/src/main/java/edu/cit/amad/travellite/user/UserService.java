package edu.cit.amad.travellite.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String supabaseKey;

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserProfileResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhotoUrl()
        );
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
        return new UserProfileResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhotoUrl()
        );
    }

    public UserProfileResponse uploadPhoto(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String uploadUrl = supabaseUrl + "/storage/v1/object/avatars/" + filename;

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("Content-Type", file.getContentType())
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200 && response.statusCode() != 201) {
                throw new IOException("Supabase upload failed: " + response.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Upload interrupted", e);
        }

        String publicUrl = supabaseUrl + "/storage/v1/object/public/avatars/" + filename;
        user.setPhotoUrl(publicUrl);
        userRepository.save(user);

        return new UserProfileResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhotoUrl()
        );
    }
}