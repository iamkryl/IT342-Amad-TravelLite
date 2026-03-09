package edu.cit.amad.travellite.service;

import edu.cit.amad.travellite.dto.AuthResponse;
import edu.cit.amad.travellite.dto.LoginRequest;
import edu.cit.amad.travellite.dto.RegisterRequest;
import edu.cit.amad.travellite.entity.User;
import edu.cit.amad.travellite.repository.UserRepository;
import edu.cit.amad.travellite.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("code", "DB-002");
            error.put("message", "Email already exists");
            return new AuthResponse(false, null, error,
                    LocalDateTime.now().toString());
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user.setRole("USER");

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> data = new HashMap<>();
        Map<String, String> userMap = new HashMap<>();
        userMap.put("first_name", user.getFirstName());
        userMap.put("last_name", user.getLastName());
        userMap.put("email", user.getEmail());
        data.put("user", userMap);
        data.put("accessToken", token);

        return new AuthResponse(true, data, null,
                LocalDateTime.now().toString());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("code", "AUTH-001");
            error.put("message", "Invalid credentials");
            return new AuthResponse(false, null, error,
                    LocalDateTime.now().toString());
        }

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> data = new HashMap<>();
        Map<String, String> userMap = new HashMap<>();
        userMap.put("first_name", user.getFirstName());
        userMap.put("last_name", user.getLastName());
        userMap.put("email", user.getEmail());
        data.put("user", userMap);
        data.put("accessToken", token);

        return new AuthResponse(true, data, null,
                LocalDateTime.now().toString());
    }
}