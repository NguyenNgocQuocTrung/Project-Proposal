package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.BookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingdetailRepo extends JpaRepository<BookingDetail, Long> {
    List<BookingDetail> findByBookingId(Long bookingId);
    BookingDetail findByBookingIdAndRoomId(Long bookingId, Long roomId);

    @Query("""
    SELECT bd FROM BookingDetail bd
    WHERE bd.booking.bookingCode = :bookingCode
    """)
    List<BookingDetail> findAllByBookingCode(@Param("bookingCode") String bookingCode);
}
