package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.IdentityRequest;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.dto.response.CheckinResponse;

public interface BookingService {
    BookingResponse save(BookingRequest request);
    void delete(Long [] id);
    CheckinResponse checkIn(IdentityRequest request);
    BookingResponse findUnpaidBooking(IdentityRequest request);
}
