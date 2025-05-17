package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.CheckinRequest;
import com.cnpm.managehotel.dto.request.IdentityRequest;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.dto.response.CheckinResponse;

public interface BookingService {
    BookingResponse findAll();
    BookingResponse save(BookingRequest request);
    void delete(String [] bookingCode);
    CheckinResponse checkIn(CheckinRequest request);
    BookingResponse findUnpaidBooking(IdentityRequest request);
}
