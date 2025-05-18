package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.config.TestSecurityConfig;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.CheckinRequest;
import com.cnpm.managehotel.dto.request.IdentityRequest;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.dto.response.CheckinResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.BookingService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
@Import(TestSecurityConfig.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @Autowired
    private ObjectMapper objectMapper;

    private BookingRequest bookingRequest;
    private BookingResponse bookingResponse;
    private CheckinRequest checkinRequest;
    private CheckinResponse checkinResponse;
    private RoomDTO roomDTO;

    @BeforeEach
    void setUp() {
        // Configure ObjectMapper for proper date handling
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Setup room DTO
        roomDTO = RoomDTO.builder()
                .id(1L)
                .roomNo(101)
                .type("A")
                .price(150000)
                .maxNum(2)
                .build();

        // Setup test data
        bookingRequest = BookingRequest.builder()
                .fullName("John Doe")
                .phoneNumber("0123456789")
                .identityNumber("123456789")
                .address("123 Test St")
                .gender("Male")
                .nationality("VN")
                .guestNum(2)
                .checkIn(Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()))
                .checkOut(Date.from(LocalDate.now().plusDays(2).atStartOfDay(ZoneId.systemDefault()).toInstant()))
                .roomNo(new int[]{101})
                .build();

        bookingResponse = BookingResponse.builder()
                .bookingCode("BK-12345678")
                .fullName("John Doe")
                .guestNum(2)
                .checkIn(bookingRequest.getCheckIn())
                .build();

        checkinRequest = new CheckinRequest();
        checkinRequest.setBookingCode("BK-12345678");
        checkinRequest.setRoomNo(101);
        checkinRequest.setForeign(false);
        checkinRequest.setExtraFree(true);

        checkinResponse = new CheckinResponse();
        checkinResponse.setBookingCode("BK-12345678");
        checkinResponse.setCustomerName("John Doe");
        checkinResponse.setCheckInTime(LocalDateTime.now());
        checkinResponse.setStatus("CHECKED_IN");
        checkinResponse.setRoom(roomDTO);
    }

    @Test
    void getAllBookings_ShouldReturnBookingList() throws Exception {
        // Arrange
        BookingResponse response = BookingResponse.builder().build();
        response.setListResult(Arrays.asList(bookingResponse));
        when(bookingService.findAll()).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/booking")
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.listResult[0].bookingCode").value(bookingResponse.getBookingCode()));

        verify(bookingService).findAll();
    }

    @Test
    void createBooking_WithValidData_ShouldCreateBooking() throws Exception {
        // Arrange
        when(bookingService.save(any(BookingRequest.class))).thenReturn(bookingResponse);

        // Act & Assert
        mockMvc.perform(post("/booking")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookingRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.bookingCode").value(bookingResponse.getBookingCode()));

        verify(bookingService).save(any(BookingRequest.class));
    }

    @Test
    void createBooking_WithInvalidDates_ShouldReturnError() throws Exception {
        // Arrange
        when(bookingService.save(any(BookingRequest.class)))
                .thenThrow(new AppException(ErrorCode.INVALID_DATE));

        // Act & Assert
        mockMvc.perform(post("/booking")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookingRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_DATE.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.INVALID_DATE.getMessage()));

        verify(bookingService).save(any(BookingRequest.class));
    }

    @Test
    void deleteBooking_WithValidData_ShouldDeleteBooking() throws Exception {
        // Arrange
        doNothing().when(bookingService).delete(any(String[].class));

        // Act & Assert
        mockMvc.perform(delete("/booking")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new String[]{"BK-12345678"})))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"));

        verify(bookingService).delete(any(String[].class));
    }

    @Test
    void deleteBooking_WithNonExistentBooking_ShouldReturnError() throws Exception {
        // Arrange
        doThrow(new AppException(ErrorCode.BOOKING_NOT_FOUND))
                .when(bookingService).delete(any(String[].class));

        // Act & Assert
        mockMvc.perform(delete("/booking")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new String[]{"INVALID-CODE"})))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCode.BOOKING_NOT_FOUND.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.BOOKING_NOT_FOUND.getMessage()));

        verify(bookingService).delete(any(String[].class));
    }

    @Test
    void checkin_WithValidData_ShouldCheckIn() throws Exception {
        // Arrange
        when(bookingService.checkIn(any(CheckinRequest.class))).thenReturn(checkinResponse);

        // Act & Assert
        mockMvc.perform(post("/booking/checkin")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkinRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.bookingCode").value(checkinResponse.getBookingCode()));

        verify(bookingService).checkIn(any(CheckinRequest.class));
    }

    @Test
    void findUnpaidBookings_WithValidUser_ShouldReturnBookings() throws Exception {
        // Arrange
        IdentityRequest request = new IdentityRequest();
        request.setIdentityNumber("123456789");
        BookingResponse response = BookingResponse.builder().build();
        response.setListResult(Arrays.asList(bookingResponse));
        when(bookingService.findUnpaidBooking(any(IdentityRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/booking/unpaid")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.listResult[0].bookingCode").value(bookingResponse.getBookingCode()));

        verify(bookingService).findUnpaidBooking(any(IdentityRequest.class));
    }

    @Test
    void findUnpaidBookings_WithNonExistentUser_ShouldReturnError() throws Exception {
        // Arrange
        IdentityRequest request = new IdentityRequest();
        request.setIdentityNumber("999999999");
        when(bookingService.findUnpaidBooking(any(IdentityRequest.class)))
                .thenThrow(new AppException(ErrorCode.USER_NOT_EXISTED));

        // Act & Assert
        mockMvc.perform(post("/booking/unpaid")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_EXISTED.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.USER_NOT_EXISTED.getMessage()));

        verify(bookingService).findUnpaidBooking(any(IdentityRequest.class));
    }
} 