package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.RoomDTO;

public interface RoomService {
    RoomDTO findAll();
    RoomDTO findAllAvailable();
    RoomDTO save(RoomDTO request);
    void delete(int[] roomNo);
}
