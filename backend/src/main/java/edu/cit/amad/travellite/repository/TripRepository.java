package edu.cit.amad.travellite.repository;

import edu.cit.amad.travellite.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByUserUserId(Long userId);
    List<Trip> findByUserUserIdAndStartDateAfter(Long userId, LocalDate date);
}