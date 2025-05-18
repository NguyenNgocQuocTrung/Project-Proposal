package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.config.TestSecurityConfig;
import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RoomController.class)
@Import(TestSecurityConfig.class)
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoomService roomService;

    @Autowired
    private ObjectMapper objectMapper;

    private RoomDTO roomDTO;

    @BeforeEach
    void setUp() {
        // Configure ObjectMapper for proper date handling
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd"));

        // Setup test data
        roomDTO = RoomDTO.builder()
                .id(1L)
                .roomNo(101)
                .type("A")
                .price(150000)
                .maxNum(2)
                .status(RoomStatus.AVAILABLE)
                .build();
    }

    @Test
    void getAllRooms_ShouldReturnRoomList() throws Exception {
        // Arrange
        RoomDTO response = RoomDTO.builder().build();
        response.setListResult(Arrays.asList(roomDTO));
        when(roomService.findAll()).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/room")
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.listResult[0].roomNo").value(roomDTO.getRoomNo()));

        verify(roomService).findAll();
    }

    @Test
    void getAllAvailableRooms_ShouldReturnAvailableRooms() throws Exception {
        // Arrange
        RoomDTO response = RoomDTO.builder().build();
        response.setListResult(Arrays.asList(roomDTO));
        when(roomService.findAllAvailable(any(Date.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/room/available")
                .param("checkinDate", "2024-03-20")
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.listResult[0].roomNo").value(roomDTO.getRoomNo()));

        verify(roomService).findAllAvailable(any(Date.class));
    }

    @Test
    void createRoom_WithValidData_ShouldCreateRoom() throws Exception {
        // Arrange
        when(roomService.save(any(RoomDTO.class))).thenReturn(roomDTO);

        // Act & Assert
        mockMvc.perform(post("/room")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roomDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.roomNo").value(roomDTO.getRoomNo()));

        verify(roomService).save(any(RoomDTO.class));
    }

    @Test
    void updateRoom_WithValidData_ShouldUpdateRoom() throws Exception {
        // Arrange
        when(roomService.save(any(RoomDTO.class))).thenReturn(roomDTO);

        // Act & Assert
        mockMvc.perform(put("/room")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roomDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.roomNo").value(roomDTO.getRoomNo()));

        verify(roomService).save(any(RoomDTO.class));
    }

    @Test
    void deleteRoom_WithValidData_ShouldDeleteRoom() throws Exception {
        // Arrange
        doNothing().when(roomService).delete(any(int[].class));

        // Act & Assert
        mockMvc.perform(delete("/room")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new int[]{101})))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"));

        verify(roomService).delete(any(int[].class));
    }

    @Test
    void createRoom_WithDuplicateRoomNo_ShouldReturnError() throws Exception {
        // Arrange
        when(roomService.save(any(RoomDTO.class)))
                .thenThrow(new AppException(ErrorCode.ROOM_CONFLICT));

        // Act & Assert
        mockMvc.perform(post("/room")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roomDTO)))
                .andDo(print())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(ErrorCode.ROOM_CONFLICT.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.ROOM_CONFLICT.getMessage()));

        verify(roomService).save(any(RoomDTO.class));
    }

    @Test
    void deleteRoom_WithNonExistentRoom_ShouldReturnError() throws Exception {
        // Arrange
        doThrow(new AppException(ErrorCode.ROOM_NOT_FOUND))
                .when(roomService).delete(any(int[].class));

        // Act & Assert
        mockMvc.perform(delete("/room")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new int[]{999})))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCode.ROOM_NOT_FOUND.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.ROOM_NOT_FOUND.getMessage()));

        verify(roomService).delete(any(int[].class));
    }
} 