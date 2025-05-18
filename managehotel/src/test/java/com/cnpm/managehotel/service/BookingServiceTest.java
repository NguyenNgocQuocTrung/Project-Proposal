package com.cnpm.managehotel.service;

import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.BookingdetailDTO;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.CheckinRequest;
import com.cnpm.managehotel.dto.request.IdentityRequest;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.entity.Booking;
import com.cnpm.managehotel.entity.BookingDetail;
import com.cnpm.managehotel.entity.Room;
import com.cnpm.managehotel.entity.User;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.BookingMapper;
import com.cnpm.managehotel.mapper.BookingdetailMapper;
import com.cnpm.managehotel.mapper.RoomMapper;
import com.cnpm.managehotel.mapper.UserMapper;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.BookingdetailRepo;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.repository.UserRepo;
import com.cnpm.managehotel.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepo bookingRepo;

    @Mock
    private BookingdetailRepo bookingdetailRepo;

    @Mock
    private RoomRepo roomRepo;

    @Mock
    private UserRepo userRepo;

    @Mock
    private BookingMapper bookingMapper;

    @Mock
    private RoomMapper roomMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private BookingdetailMapper bookingdetailMapper;

    @Mock
    private BookingdetailService bookingdetailService;

    @Mock
    private RoomService roomService;

    @Mock
    private UserService userService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private BookingRequest bookingRequest;
    private User user;
    private Room room;
    private Booking booking;
    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        // Setup test data
        user = new User();
        user.setId(1L);
        user.setFullName("John Doe");
        user.setIdentityNumber("123456789");
        user.setPhoneNumber("0123456789");
        user.setAddress("123 Test St");
        user.setGender("Male");
        user.setNationality("VN");

        room = new Room();
        room.setId(1L);
        room.setRoomNo(101);
        room.setType('A');
        room.setPrice(150000);
        room.setMaxNum(2);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setBookingDetails(new ArrayList<>());

        booking = new Booking();
        booking.setId(1L);
        booking.setBookingCode("BK-12345678");
        booking.setUser(user);
        booking.setCheckIn(Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()));
        booking.setCheckOut(Date.from(LocalDate.now().plusDays(2).atStartOfDay(ZoneId.systemDefault()).toInstant()));
        booking.setGuestNum(2);
        booking.setIsPaid(false);
        booking.setBookingDetails(new ArrayList<>());

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
                .checkIn(booking.getCheckIn())
                .build();
    }

    @Test
    void findAll_ShouldReturnAllBookingsInCurrentMonth() {
        // Arrange
        List<Booking> bookings = Arrays.asList(booking);
        when(bookingRepo.findAllByCheckInBetween(any(Date.class), any(Date.class))).thenReturn(bookings);
        when(bookingMapper.toDto(booking)).thenReturn(bookingResponse);

        // Act
        BookingResponse result = bookingService.findAll();

        // Assert
        assertNotNull(result);
        assertNotNull(result.getListResult());
        assertEquals(1, result.getListResult().size());
        verify(bookingRepo).findAllByCheckInBetween(any(Date.class), any(Date.class));
    }

    @Test
    void save_NewBooking_WithExistingUser_ShouldCreateBooking() {
        // Arrange
        List<Room> rooms = Arrays.asList(room);
        when(roomRepo.findByRoomNoIn(any())).thenReturn(rooms);
        when(userRepo.findByIdentityNumber(bookingRequest.getIdentityNumber())).thenReturn(Optional.of(user));
        when(bookingMapper.toEntity(bookingRequest)).thenReturn(booking);
        when(bookingRepo.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toDto(booking)).thenReturn(bookingResponse);

        // Act
        BookingResponse result = bookingService.save(bookingRequest);

        // Assert
        assertNotNull(result);
        assertEquals(bookingResponse.getBookingCode(), result.getBookingCode());
        verify(bookingRepo).save(any(Booking.class));
        verify(bookingdetailService, times(1)).save(any(BookingdetailDTO.class));
    }

    @Test
    void save_NewBooking_WithNewUser_ShouldCreateBookingAndUser() {
        // Arrange
        List<Room> rooms = Arrays.asList(room);
        when(roomRepo.findByRoomNoIn(any())).thenReturn(rooms);
        when(userRepo.findByIdentityNumber(bookingRequest.getIdentityNumber())).thenReturn(Optional.empty());
        when(userService.save(any(UserDTO.class))).thenReturn(new UserDTO());
        when(userMapper.toEntity(any(UserDTO.class))).thenReturn(user);
        when(bookingMapper.toEntity(bookingRequest)).thenReturn(booking);
        when(bookingRepo.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toDto(booking)).thenReturn(bookingResponse);

        // Act
        BookingResponse result = bookingService.save(bookingRequest);

        // Assert
        assertNotNull(result);
        assertEquals(bookingResponse.getBookingCode(), result.getBookingCode());
        verify(userService).save(any(UserDTO.class));
        verify(bookingRepo).save(any(Booking.class));
    }

    @Test
    void save_WithInvalidDates_ShouldThrowException() {
        // Arrange
        bookingRequest.setCheckOut(Date.from(LocalDate.now().minusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> bookingService.save(bookingRequest));
        assertEquals(ErrorCode.INVALID_DATE, exception.getErrorCode());
    }

    @Test
    void save_WithNonExistentRoom_ShouldThrowException() {
        // Arrange
        when(roomRepo.findByRoomNoIn(any())).thenReturn(Collections.emptyList());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> bookingService.save(bookingRequest));
        assertEquals(ErrorCode.ROOM_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void delete_ValidBooking_ShouldDeleteBooking() {
        // Arrange
        String[] bookingCodes = {"BK-12345678"};
        List<Booking> bookings = Arrays.asList(booking);
        when(bookingRepo.findAllByBookingCodeIn(Arrays.asList(bookingCodes))).thenReturn(bookings);

        // Act
        assertDoesNotThrow(() -> bookingService.delete(bookingCodes));

        // Assert
        verify(bookingdetailService).delete(booking.getId(), RoomStatus.AVAILABLE);
        verify(bookingRepo).delete(booking);
    }

    @Test
    void delete_NonExistentBooking_ShouldThrowException() {
        // Arrange
        String[] bookingCodes = {"INVALID-CODE"};
        when(bookingRepo.findAllByBookingCodeIn(Arrays.asList(bookingCodes))).thenReturn(Collections.emptyList());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> bookingService.delete(bookingCodes));
        assertEquals(ErrorCode.BOOKING_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void findUnpaidBooking_WithValidUser_ShouldReturnUnpaidBookings() {
        // Arrange
        IdentityRequest request = new IdentityRequest();
        request.setIdentityNumber("123456789");
        List<Booking> bookings = Arrays.asList(booking);

        when(userRepo.findByIdentityNumber(request.getIdentityNumber())).thenReturn(Optional.of(user));
        when(bookingRepo.findByUserIdAndIsPaidFalse(user.getId())).thenReturn(bookings);
        when(bookingMapper.toDto(booking)).thenReturn(bookingResponse);

        // Act
        BookingResponse result = bookingService.findUnpaidBooking(request);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getListResult());
        assertEquals(1, result.getListResult().size());
        verify(bookingRepo).findByUserIdAndIsPaidFalse(user.getId());
    }

    @Test
    void findUnpaidBooking_WithNonExistentUser_ShouldThrowException() {
        // Arrange
        IdentityRequest request = new IdentityRequest();
        request.setIdentityNumber("999999999");
        when(userRepo.findByIdentityNumber(request.getIdentityNumber())).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> bookingService.findUnpaidBooking(request));
        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
    }
} 