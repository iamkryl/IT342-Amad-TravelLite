package edu.cit.amad.travellite.trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByUserUserId(Long userId);
    List<Trip> findByUserUserIdAndStartDateAfter(Long userId, LocalDate date);
    @Query("SELECT tc.trip FROM TripCompanion tc WHERE tc.user.userId = :userId")
    List<Trip> findCompanionTripsByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM Trip t JOIN TripCompanion tc ON tc.trip.tripId = t.tripId WHERE tc.user.userId = :userId AND t.startDate > :date")
    List<Trip> findCompanionUpcomingTripsByUserId(@Param("userId") Long userId, @Param("date") LocalDate date);
}