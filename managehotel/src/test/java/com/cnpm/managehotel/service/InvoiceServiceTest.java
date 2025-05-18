package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.response.InvoiceResponse;
import com.cnpm.managehotel.dto.response.ServiceResponse;
import com.cnpm.managehotel.entity.*;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.BookingMapper;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.BookingdetailRepo;
import com.cnpm.managehotel.repository.InvoiceRepo;
import com.cnpm.managehotel.repository.ServiceRepo;
import com.cnpm.managehotel.service.impl.InvoiceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private BookingRepo bookingRepo;

    @Mock
    private BookingdetailRepo bookingdetailRepo;

    @Mock
    private ServiceRepo serviceRepo;

    @Mock
    private InvoiceRepo invoiceRepo;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private Booking booking;
    private User user;
    private Room room;
    private BookingDetail bookingDetail;
    private Product product;
    private ServiceEntity service;

    @BeforeEach
    void setUp() {
        // Setup User
        user = new User();
        user.setId(1L);
        user.setFullName("John Doe");
        user.setPhoneNumber("0123456789");

        // Setup Room
        room = new Room();
        room.setId(1L);
        room.setRoomNo(101);
        room.setPrice(150000);

        // Setup Booking
        booking = new Booking();
        booking.setId(1L);
        booking.setBookingCode("BK-12345678");
        booking.setUser(user);
        booking.setCheckIn(Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()));
        booking.setCheckOut(Date.from(LocalDate.now().plusDays(2).atStartOfDay(ZoneId.systemDefault()).toInstant()));
        booking.setIsPaid(false);

        // Setup BookingDetail
        bookingDetail = new BookingDetail();
        bookingDetail.setId(1L);
        bookingDetail.setBooking(booking);
        bookingDetail.setRoom(room);
        bookingDetail.setUnit(2);

        // Setup Product
        product = new Product();
        product.setId(1L);
        product.setTitle("Extra Bed");
        product.setPrice(50000);

        // Setup Service
        service = new ServiceEntity();
        service.setId(1L);
        service.setBooking(booking);
        service.setProduct(product);
        service.setAmount(1);
        service.setPrice(product.getPrice());
    }

    @Test
    void preview_WithValidBookingCode_ShouldReturnInvoiceResponse() {
        // Arrange
        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.of(booking));
        when(bookingdetailRepo.findByBookingId(booking.getId())).thenReturn(Arrays.asList(bookingDetail));
        when(serviceRepo.findByBookingId(booking.getId())).thenReturn(Arrays.asList(service));
        when(invoiceRepo.save(any(Invoice.class))).thenReturn(new Invoice());

        // Act
        InvoiceResponse response = invoiceService.preview("BK-12345678");

        // Assert
        assertNotNull(response);
        assertEquals(user.getFullName(), response.getCustomerName());
        assertEquals(user.getPhoneNumber(), response.getCustomerPhone());
        assertEquals(booking.getCheckIn(), response.getCheckIn());
        assertEquals(booking.getCheckOut(), response.getCheckOut());
        assertEquals(2, response.getNightCount());
        assertEquals("101", response.getRoomNo());
        assertEquals(300000, response.getRoomTotal()); // 150000 * 2 nights
        assertEquals(50000, response.getServiceTotal());
        assertEquals(350000, response.getTotalAmount());
        assertEquals("Unpaid", response.getPaymentStatus());

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verify(bookingdetailRepo).findByBookingId(booking.getId());
        verify(serviceRepo).findByBookingId(booking.getId());
        verify(invoiceRepo).save(any(Invoice.class));
    }

    @Test
    void preview_WithNonExistentBookingCode_ShouldThrowException() {
        // Arrange
        when(bookingRepo.findByBookingCode("INVALID-CODE")).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> invoiceService.preview("INVALID-CODE"));
        assertEquals(ErrorCode.BOOKING_NOT_FOUND, exception.getErrorCode());

        verify(bookingRepo).findByBookingCode("INVALID-CODE");
        verifyNoInteractions(bookingdetailRepo, serviceRepo, invoiceRepo);
    }

    @Test
    void preview_WithNoServices_ShouldCalculateOnlyRoomTotal() {
        // Arrange
        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.of(booking));
        when(bookingdetailRepo.findByBookingId(booking.getId())).thenReturn(Arrays.asList(bookingDetail));
        when(serviceRepo.findByBookingId(booking.getId())).thenReturn(List.of());
        when(invoiceRepo.save(any(Invoice.class))).thenReturn(new Invoice());

        // Act
        InvoiceResponse response = invoiceService.preview("BK-12345678");

        // Assert
        assertNotNull(response);
        assertEquals(300000, response.getRoomTotal()); // 150000 * 2 nights
        assertEquals(0, response.getServiceTotal());
        assertEquals(300000, response.getTotalAmount());
        assertTrue(response.getServices().isEmpty());

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verify(bookingdetailRepo).findByBookingId(booking.getId());
        verify(serviceRepo).findByBookingId(booking.getId());
        verify(invoiceRepo).save(any(Invoice.class));
    }

    @Test
    void preview_WithMultipleRooms_ShouldCalculateTotalCorrectly() {
        // Arrange
        Room room2 = new Room();
        room2.setId(2L);
        room2.setRoomNo(102);
        room2.setPrice(200000);

        BookingDetail bookingDetail2 = new BookingDetail();
        bookingDetail2.setId(2L);
        bookingDetail2.setBooking(booking);
        bookingDetail2.setRoom(room2);
        bookingDetail2.setUnit(2);

        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.of(booking));
        when(bookingdetailRepo.findByBookingId(booking.getId()))
                .thenReturn(Arrays.asList(bookingDetail, bookingDetail2));
        when(serviceRepo.findByBookingId(booking.getId())).thenReturn(Arrays.asList(service));
        when(invoiceRepo.save(any(Invoice.class))).thenReturn(new Invoice());

        // Act
        InvoiceResponse response = invoiceService.preview("BK-12345678");

        // Assert
        assertNotNull(response);
        assertEquals("101, 102", response.getRoomNo());
        assertEquals(700000, response.getRoomTotal()); // (150000 + 200000) * 2 nights
        assertEquals(50000, response.getServiceTotal());
        assertEquals(750000, response.getTotalAmount());

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verify(bookingdetailRepo).findByBookingId(booking.getId());
        verify(serviceRepo).findByBookingId(booking.getId());
        verify(invoiceRepo).save(any(Invoice.class));
    }
} 