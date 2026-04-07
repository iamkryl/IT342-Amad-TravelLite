package edu.cit.amad.travellite.dto;

public class WeatherResponse {

    private String destination;
    private long temperature;
    private String condition;

    public WeatherResponse(String destination, long temperature, String condition) {
        this.destination = destination;
        this.temperature = temperature;
        this.condition = condition;
    }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public long getTemperature() { return temperature; }
    public void setTemperature(long temperature) { this.temperature = temperature; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
}