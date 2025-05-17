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
    List<Room> findByStatus(String status);

    @Query("SELECT bd.room FROM BookingDetail bd WHERE bd.booking.bookingCode = :bookingCode")
    List<Room> findRoomsByBookingCode(@Param("bookingCode") String bookingCode);

    @Query(value = """
    SELECT * FROM room
    WHERE status != 'MAINTAIN'
      AND id NOT IN (
          SELECT bd.room_id
          FROM booking_detail bd
          JOIN booking b ON b.id = bd.booking_id
          WHERE :checkInDate < b.check_out
      )
    """, nativeQuery = true)
    List<Room> findAvailableRoomsAt(@Param("checkInDate") Date checkInDate);
}
