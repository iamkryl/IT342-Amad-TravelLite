package edu.cit.amad.travellite.dto;

public class AuthResponse {

    private boolean success;
    private Object data;
    private Object error;
    private String timestamp;

    public AuthResponse(boolean success, Object data, Object error, String timestamp) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.timestamp = timestamp;
    }

    public boolean isSuccess() { return success; }
    public Object getData() { return data; }
    public Object getError() { return error; }
    public String getTimestamp() { return timestamp; }

    public void setSuccess(boolean success) { this.success = success; }
    public void setData(Object data) { this.data = data; }
    public void setError(Object error) { this.error = error; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}