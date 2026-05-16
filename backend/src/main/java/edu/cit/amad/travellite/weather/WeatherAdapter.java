package edu.cit.amad.travellite.weather;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class WeatherAdapter {

    @Value("${openweathermap.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherResponse getWeather(String destination) {
        try {
            String cleanDestination = destination.split(",")[0].trim();
            String url = "https://api.openweathermap.org/data/2.5/weather?q="
                    + cleanDestination
                    + "&appid=" + apiKey
                    + "&units=metric";

            Map<String, Object> rawResponse = restTemplate.getForObject(url, Map.class);

            if (rawResponse == null) return null;

            Map<String, Object> main = (Map<String, Object>) rawResponse.get("main");
            List<Map<String, Object>> weatherList =
                    (List<Map<String, Object>>) rawResponse.get("weather");

            double temperature = main != null
                    ? ((Number) main.get("temp")).doubleValue() : 0;

            String condition = (weatherList != null && !weatherList.isEmpty())
                    ? (String) weatherList.get(0).get("description")
                    : "Unknown";

            return new WeatherResponse(destination, Math.round(temperature), condition);

        } catch (Exception e) {
            return null;
        }
    }
}