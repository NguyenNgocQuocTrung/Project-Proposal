package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface RoomRepo extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomNo(int roomNo);
    List<Room> findByRoomNoIn(List<Integer> roomNo);

    @Query("SELECT bd.room FROM BookingDetail bd WHERE bd.booking.bookingCode = :bookingCode")
    List<Room> findRoomsByBookingCode(@Param("bookingCode") String bookingCode);

    @Query("""
    SELECT r FROM Room r
    WHERE r.status != 'MAINTAIN'
    AND r.id NOT IN (
       SELECT bd.room.id
       FROM BookingDetail bd
       JOIN bd.booking b
       WHERE FUNCTION('date', b.checkOut) >= FUNCTION('date', :checkInDate)
       AND FUNCTION('date', b.checkIn) < FUNCTION('date', :checkOutDate)
    )
    """)
    List<Room> findAvailableRoomsBetween(
            @Param("checkInDate") Date checkInDate,
            @Param("checkOutDate") Date checkOutDate);

    @Query("SELECT COUNT(r) FROM Room r")
    int countTotalRooms();

    int countByStatus(String status);
}
