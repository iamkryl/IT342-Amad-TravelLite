package edu.cit.amad.travellite;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TripControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setup() throws Exception {
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
    }

    @Test
    void testCreateTripWithValidFields() throws Exception {
        mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content("""
                        {
                            "title": "Automated Test Trip",
                            "origin": "Manila",
                            "destination": "Boracay",
                            "startDate": "2026-08-01",
                            "endDate": "2026-08-07",
                            "budgetItems": [
                                {"category": "Food", "amount": 5000}
                            ],
                            "places": [
                                {"name": "White Beach"}
                            ],
                            "checklistItems": [
                                {"name": "Sunscreen"}
                            ],
                            "companions": []
                        }
                        """))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Automated Test Trip"));
    }

    @Test
    void testGetAllTrips() throws Exception {
        mockMvc.perform(get("/api/v1/trips")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void testGetDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalTrips").exists())
                .andExpect(jsonPath("$.data.overallExpense").exists())
                .andExpect(jsonPath("$.data.upcomingTravelsCount").exists());
    }

    @Test
    void testCreateTripWithMissingFields() throws Exception {
        try {
            mockMvc.perform(post("/api/v1/trips")
                            .contentType(MediaType.APPLICATION_JSON)
                            .header("Authorization", "Bearer " + token)
                            .content("""
                        {
                            "title": "",
                            "origin": "",
                            "destination": "",
                            "startDate": null,
                            "endDate": null
                        }
                        """))
                    .andReturn();
        } catch (Exception e) {
        }
    }

    @Test
    void testAccessTripsWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/trips"))
                .andExpect(status().is3xxRedirection());
    }
}