package edu.cit.amad.travellite.security;

import edu.cit.amad.travellite.entity.User;
import edu.cit.amad.travellite.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        String googleId = oAuth2User.getAttribute("sub");
        String photoUrl = oAuth2User.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
            }
            if (user.getPhotoUrl() == null) {
                user.setPhotoUrl(photoUrl);
            }
        } else {
            user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName != null ? lastName : "");
            user.setGoogleId(googleId);
            user.setPhotoUrl(photoUrl);
            user.setPasswordHash("");
            user.setIsActive(true);
            user.setRole("USER");
        }

        userRepository.save(user);

        String token = jwtUtil.generateToken(email);

        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + token
                + "&firstName=" + firstName
                + "&lastName=" + (lastName != null ? lastName : "")
                + "&email=" + email);
    }
}