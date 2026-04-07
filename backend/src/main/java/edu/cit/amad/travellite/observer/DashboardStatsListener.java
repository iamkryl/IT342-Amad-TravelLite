package edu.cit.amad.travellite.observer;

import org.springframework.stereotype.Component;

public class DashboardStatsListener implements TripEventListener {

    @Override
    public void onTripEvent(TripEvent event) {
        if (event.getType() == TripEvent.Type.TRIP_CREATED) {
            System.out.println("[OBSERVER] Trip created for user "
                    + event.getUserId()
                    + " — dashboard stats need refresh.");
        } else if (event.getType() == TripEvent.Type.TRIP_DELETED) {
            System.out.println("[OBSERVER] Trip deleted for user "
                    + event.getUserId()
                    + " — dashboard stats need refresh.");
        }
    }
}