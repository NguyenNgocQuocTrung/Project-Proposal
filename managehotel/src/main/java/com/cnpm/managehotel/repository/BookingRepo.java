package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BookingRepo extends JpaRepository<Booking, Long> {

    @Query("""
    SELECT b FROM Booking b
    JOIN BookingDetail bd ON bd.booking.id = b.id
    JOIN Room r ON r.id = bd.room.id
    WHERE r.roomNo = :roomNo
      AND r.status = 'BOOKED'
      AND CURRENT_TIMESTAMP BETWEEN b.checkIn AND b.checkOut
    """)
    Optional<Booking> findByRoomNo(@Param("roomNo") int roomNo);
}
