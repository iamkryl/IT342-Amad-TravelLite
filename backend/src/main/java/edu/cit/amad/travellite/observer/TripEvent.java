package edu.cit.amad.travellite.observer;

public class TripEvent {

    public enum Type { TRIP_CREATED, TRIP_DELETED }

    private final Long userId;
    private final Type type;

    public TripEvent(Long userId, Type type) {
        this.userId = userId;
        this.type = type;
    }

    public Long getUserId() { return userId; }
    public Type getType() { return type; }
}