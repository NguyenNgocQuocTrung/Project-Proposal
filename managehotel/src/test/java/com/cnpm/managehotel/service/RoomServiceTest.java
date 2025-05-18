package com.cnpm.managehotel.service;

import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.entity.Room;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.RoomMapper;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.service.impl.RoomServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepo roomRepo;

    @Mock
    private RoomMapper roomMapper;

    @InjectMocks
    private RoomServiceImpl roomService;

    private Room room;
    private RoomDTO roomDTO;
    private List<Room> roomList;
    private List<RoomDTO> roomDTOList;

    @BeforeEach
    void setUp() {
        // Setup test data
        room = new Room();
        room.setId(1L);
        room.setRoomNo(101);
        room.setType('A');
        room.setPrice(150000);
        room.setMaxNum(2);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setBookingDetails(new ArrayList<>());

        roomDTO = new RoomDTO();
        roomDTO.setId(1L);
        roomDTO.setRoomNo(101);
        roomDTO.setType("A");
        roomDTO.setPrice(150000);
        roomDTO.setMaxNum(2);
        roomDTO.setStatus(RoomStatus.AVAILABLE);

        roomList = Arrays.asList(room);
        roomDTOList = Arrays.asList(roomDTO);
    }

    @Test
    void findAll_ShouldReturnAllRooms() {
        // Arrange
        when(roomRepo.findAll()).thenReturn(roomList);
        when(roomMapper.toListDTO(roomList)).thenReturn(roomDTOList);

        // Act
        RoomDTO result = roomService.findAll();

        // Assert
        assertNotNull(result);
        assertNotNull(result.getListResult());
        assertEquals(1, result.getListResult().size());
        verify(roomRepo).findAll();
        verify(roomMapper).toListDTO(roomList);
    }

    @Test
    void findAllAvailable_ShouldReturnAvailableRooms() {
        // Arrange
        Date checkinDate = new Date();
        when(roomRepo.findAvailableRoomsAt(checkinDate)).thenReturn(roomList);
        when(roomMapper.toListDTO(roomList)).thenReturn(roomDTOList);

        // Act
        RoomDTO result = roomService.findAllAvailable(checkinDate);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getListResult());
        assertEquals(1, result.getListResult().size());
        verify(roomRepo).findAvailableRoomsAt(checkinDate);
        verify(roomMapper).toListDTO(roomList);
    }

    @Test
    void save_NewRoom_ShouldCreateRoom() {
        // Arrange
        when(roomRepo.findByRoomNo(roomDTO.getRoomNo())).thenReturn(Optional.empty());
        when(roomMapper.toEntity(roomDTO)).thenReturn(room);
        when(roomRepo.save(room)).thenReturn(room);
        when(roomMapper.toDTO(room)).thenReturn(roomDTO);

        // Act
        RoomDTO result = roomService.save(roomDTO);

        // Assert
        assertNotNull(result);
        assertEquals(roomDTO.getRoomNo(), result.getRoomNo());
        verify(roomRepo).findByRoomNo(roomDTO.getRoomNo());
        verify(roomMapper).toEntity(roomDTO);
        verify(roomRepo).save(room);
        verify(roomMapper).toDTO(room);
    }

    @Test
    void save_ExistingRoom_ShouldUpdateRoom() {
        // Arrange
        roomDTO.setId(1L);
        when(roomRepo.findByRoomNo(roomDTO.getRoomNo())).thenReturn(Optional.empty());
        when(roomRepo.findById(roomDTO.getId())).thenReturn(Optional.of(room));
        when(roomRepo.save(room)).thenReturn(room);
        when(roomMapper.toDTO(room)).thenReturn(roomDTO);

        // Act
        RoomDTO result = roomService.save(roomDTO);

        // Assert
        assertNotNull(result);
        assertEquals(roomDTO.getRoomNo(), result.getRoomNo());
        verify(roomRepo).findById(roomDTO.getId());
        verify(roomMapper).updateEntity(roomDTO, room);
        verify(roomRepo).save(room);
        verify(roomMapper).toDTO(room);
    }

    @Test
    void save_DuplicateRoomNo_ShouldThrowException() {
        // Arrange
        Room existingRoom = new Room();
        existingRoom.setId(2L);
        existingRoom.setRoomNo(roomDTO.getRoomNo());
        
        when(roomRepo.findByRoomNo(roomDTO.getRoomNo())).thenReturn(Optional.of(existingRoom));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> roomService.save(roomDTO));
        assertEquals(ErrorCode.ROOM_CONFLICT, exception.getErrorCode());
        verify(roomRepo).findByRoomNo(roomDTO.getRoomNo());
        verify(roomRepo, never()).save(any());
    }

    @Test
    void delete_ValidRooms_ShouldDeleteRooms() {
        // Arrange
        int[] roomNumbers = {101};
        List<Integer> roomNoList = Arrays.stream(roomNumbers).boxed().toList();
        when(roomRepo.findByRoomNoIn(roomNoList)).thenReturn(roomList);

        // Act
        assertDoesNotThrow(() -> roomService.delete(roomNumbers));

        // Assert
        verify(roomRepo).findByRoomNoIn(roomNoList);
        verify(roomRepo).deleteAll(roomList);
    }

    @Test
    void delete_NonExistentRoom_ShouldThrowException() {
        // Arrange
        int[] roomNumbers = {999};
        List<Integer> roomNoList = Arrays.stream(roomNumbers).boxed().toList();
        when(roomRepo.findByRoomNoIn(roomNoList)).thenReturn(Collections.emptyList());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> roomService.delete(roomNumbers));
        assertEquals(ErrorCode.ROOM_NOT_FOUND, exception.getErrorCode());
        verify(roomRepo).findByRoomNoIn(roomNoList);
        verify(roomRepo, never()).deleteAll(any());
    }

    @Test
    void delete_RoomInUse_ShouldThrowException() {
        // Arrange
        room.setBookingDetails(List.of()); // Add a booking detail to simulate room in use
        int[] roomNumbers = {101};
        List<Integer> roomNoList = Arrays.stream(roomNumbers).boxed().toList();
        when(roomRepo.findByRoomNoIn(roomNoList)).thenReturn(roomList);

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> roomService.delete(roomNumbers));
        assertEquals(ErrorCode.ROOM_IN_USE, exception.getErrorCode());
        verify(roomRepo).findByRoomNoIn(roomNoList);
        verify(roomRepo, never()).deleteAll(any());
    }
} 