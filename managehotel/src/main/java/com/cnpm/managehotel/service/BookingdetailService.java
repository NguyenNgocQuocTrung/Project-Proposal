package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.BookingdetailDTO;

public interface BookingdetailService {
    BookingdetailDTO save(BookingdetailDTO request);
    void delete(Long id, String status);
}
