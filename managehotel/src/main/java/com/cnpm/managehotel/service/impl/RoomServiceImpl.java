package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.entity.Room;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.RoomMapper;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    RoomRepo roomRepo;

    @Autowired
    RoomMapper roomMapper;

    @Override
    public RoomDTO findAll() {
        List<Room> rooms = roomRepo.findAll();

        List<RoomDTO> roomDTOs = roomMapper.toListDTO(rooms);

        RoomDTO result = new RoomDTO();
        result.setListResult(roomDTOs);
        return result;
    }

    @Override
    public RoomDTO findAllAvailable(Date checkinDate) {
        List<Room> rooms = roomRepo.findAvailableRoomsAt(checkinDate);

        List<RoomDTO> roomDTOs = roomMapper.toListDTO(rooms);

        RoomDTO result = new RoomDTO();
        result.setListResult(roomDTOs);
        return result;
    }

    @Override
    public RoomDTO save(RoomDTO request) {
        Room entity;

        if (request.getId() != null) {
            Optional<Room> conflictRoom = roomRepo.findByRoomNo(request.getRoomNo());
            if (conflictRoom.isPresent() && !conflictRoom.get().getId().equals(request.getId())) {
                throw new AppException(ErrorCode.ROOM_CONFLICT);
            }

            entity = roomRepo.findById(request.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

            roomMapper.updateEntity(request, entity);
        } else {
            if (roomRepo.findByRoomNo(request.getRoomNo()).isPresent()) {
                throw new AppException(ErrorCode.ROOM_CONFLICT);
            }
            entity = roomMapper.toEntity(request);
        }

        Room saved = roomRepo.save(entity);
        return roomMapper.toDTO(saved);
    }

    @Override
    public void delete(int[] roomNo) {
        List<Integer> roomNoList = Arrays.stream(roomNo).boxed().toList();
        List<Room> rooms = roomRepo.findByRoomNoIn(roomNoList);

        if (rooms.size() != roomNoList.size()) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }

        for (Room room : rooms) {
            if (!room.getBookingDetails().isEmpty()) {
                throw new AppException(ErrorCode.ROOM_IN_USE);
            }
        }

        roomRepo.deleteAll(rooms);
    }


}
