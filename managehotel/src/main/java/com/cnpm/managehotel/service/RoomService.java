package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.RoomDTO;

import java.util.Date;

public interface RoomService {
    RoomDTO findAll();
    RoomDTO findAllAvailable(Date checkinDate, Date checkoutDate);
    RoomDTO findAllRoomByBookingCode(String bookingCode);
    RoomDTO save(RoomDTO request);
    void delete(int[] roomNo);
}
