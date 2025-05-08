package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepo extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomNo(int roomNo);
    List<Room> findByRoomNoIn(List<Integer> roomNo);
}
