package edu.cit.amad.travellite.user;

public class UserProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String photoUrl;

    public UserProfileResponse(Long userId, String firstName, String lastName, String email, String photoUrl) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.photoUrl = photoUrl;
    }

    public Long getUserId() { return userId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhotoUrl() { return photoUrl; }
}