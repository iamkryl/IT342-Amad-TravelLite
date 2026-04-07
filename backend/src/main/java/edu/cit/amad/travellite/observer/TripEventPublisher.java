package edu.cit.amad.travellite.observer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TripEventPublisher {

    private final List<TripEventListener> listeners;

    @Autowired
    public TripEventPublisher(List<TripEventListener> listeners) {
        this.listeners = listeners;
    }

    public void publishTripCreated(Long userId) {
        notifyAllListeners(new TripEvent(userId, TripEvent.Type.TRIP_CREATED));
    }

    public void publishTripDeleted(Long userId) {
        notifyAllListeners(new TripEvent(userId, TripEvent.Type.TRIP_DELETED));
    }

    private void notifyAllListeners(TripEvent event) {
        for (TripEventListener listener : listeners) {
            listener.onTripEvent(event);
        }
    }
}