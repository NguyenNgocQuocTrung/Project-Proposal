package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.BookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingdetailRepo extends JpaRepository<BookingDetail, Long> {
    List<BookingDetail> findByBookingId(Long bookingId);
}
