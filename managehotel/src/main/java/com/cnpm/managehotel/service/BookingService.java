package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.response.BookingResponse;

public interface BookingService {
    BookingResponse save(BookingRequest request);
    void delete(Long [] id);
}
