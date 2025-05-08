package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.RoomDTO;

public interface RoomService {
    RoomDTO findALL();
    RoomDTO save(RoomDTO request);
    void delete(int[] roomNo);
}
