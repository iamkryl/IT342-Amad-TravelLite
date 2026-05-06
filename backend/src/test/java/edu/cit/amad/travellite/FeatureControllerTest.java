package edu.cit.amad.travellite;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class FeatureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;
    private Integer tripId;

    @BeforeEach
    void setup() throws Exception {
        // Login
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "email": "erik@gmail.com",
                            "password": "Erik123*"
                        }
                        """))
                .andReturn();

        String response = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(response);
        token = json.get("data").get("accessToken").asText();

        // Create a trip to use in tests
        MvcResult tripResult = mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content("""
                        {
                            "title": "Feature Test Trip",
                            "origin": "Manila",
                            "destination": "Boracay",
                            "startDate": "2026-09-01",
                            "endDate": "2026-09-07",
                            "budgetItems": [
                                {"category": "Food", "amount": 3000}
                            ],
                            "places": [{"name": "White Beach"}],
                            "checklistItems": [{"name": "Sunscreen"}],
                            "companions": []
                        }
                        """))
                .andReturn();

        String tripResponse = tripResult.getResponse().getContentAsString();
        JsonNode tripJson = objectMapper.readTree(tripResponse);
        tripId = tripJson.get("data").get("tripId").asInt();
    }

    @Test
    void testGetUserProfile() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("erik@gmail.com"));
    }

    @Test
    void testGetWeatherForTrip() throws Exception {
        mockMvc.perform(get("/api/v1/trips/" + tripId + "/weather")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void testAddCompanionToTrip() throws Exception {
        mockMvc.perform(put("/api/v1/trips/" + tripId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content("""
                        {
                            "title": "Feature Test Trip",
                            "origin": "Manila",
                            "destination": "Boracay",
                            "startDate": "2026-09-01",
                            "endDate": "2026-09-07",
                            "budgetItems": [
                                {"category": "Food", "amount": 3000}
                            ],
                            "places": [{"name": "White Beach"}],
                            "checklistItems": [{"name": "Sunscreen"}],
                            "companions": [
                                {"email": "erik@gmail.com"}
                            ]
                        }
                        """))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testBudgetValidationRejectsZeroAmount() throws Exception {
        mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content("""
                        {
                            "title": "Budget Test Trip",
                            "origin": "Manila",
                            "destination": "Cebu",
                            "startDate": "2026-10-01",
                            "endDate": "2026-10-05",
                            "budgetItems": [
                                {"category": "Food", "amount": 0}
                            ],
                            "places": [],
                            "checklistItems": [],
                            "companions": []
                        }
                        """))
                .andExpect(status().is2xxSuccessful());
    }
}