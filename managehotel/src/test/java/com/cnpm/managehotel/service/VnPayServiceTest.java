package com.cnpm.managehotel.service;

import com.cnpm.managehotel.config.VnPayConfig;
import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.response.PaymentResponse;
import com.cnpm.managehotel.entity.Booking;
import com.cnpm.managehotel.entity.Invoice;
import com.cnpm.managehotel.entity.Room;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.InvoiceRepo;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.service.impl.VnPayServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VnPayServiceTest {

    @Mock
    private VnPayConfig vnPayConfig;

    @Mock
    private BookingRepo bookingRepo;

    @Mock
    private InvoiceRepo invoiceRepo;

    @Mock
    private RoomRepo roomRepo;

    @InjectMocks
    private VnPayServiceImpl vnPayService;

    private MockHttpServletRequest request;
    private Booking booking;
    private Invoice invoice;
    private Room room;
    private Map<String, String> vnpParams;

    @BeforeEach
    void setUp() {
        // Setup request
        request = new MockHttpServletRequest();
        request.setParameter("bookingCode", "BK-12345678");
        request.setParameter("amount", "1000000");
        request.setParameter("bankCode", "NCB");

        // Setup booking
        booking = new Booking();
        booking.setId(1L);
        booking.setBookingCode("BK-12345678");
        booking.setIsPaid(false);

        // Setup invoice
        invoice = new Invoice();
        invoice.setId(1L);
        invoice.setBooking(booking);
        invoice.setTotalAmount(1000000);

        // Setup room
        room = new Room();
        room.setId(1L);
        room.setRoomNo(101);
        room.setStatus(RoomStatus.OCCUPIED);

        // Setup VNPay parameters
        vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", "DEMO");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", "BK-12345678");
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang:BK-12345678");
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_ReturnUrl", "http://localhost:8080/vn-pay-callback");
    }

    @Test
    void createVnPayPayment_WithValidData_ShouldReturnPaymentUrl() {
        // Arrange
        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.of(booking));
        when(invoiceRepo.findByBookingId(booking.getId())).thenReturn(Optional.of(invoice));
        when(vnPayConfig.getVNPayConfig()).thenReturn(vnpParams);
        when(vnPayConfig.getVnp_PayUrl()).thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        when(vnPayConfig.getSecretKey()).thenReturn("DEMO_SECRET_KEY");

        // Act
        PaymentResponse response = vnPayService.createVnPayPayment(request);

        // Assert
        assertNotNull(response);
        assertTrue(response.getURL().startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?"));
        assertTrue(response.getURL().contains("vnp_Amount=100000000")); // amount * 100
        assertTrue(response.getURL().contains("vnp_TxnRef=BK-12345678"));

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verify(invoiceRepo).findByBookingId(booking.getId());
        verify(vnPayConfig).getVNPayConfig();
        verify(vnPayConfig).getVnp_PayUrl();
        verify(vnPayConfig).getSecretKey();
    }

    @Test
    void createVnPayPayment_WithNonExistentBooking_ShouldThrowException() {
        // Arrange
        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> vnPayService.createVnPayPayment(request));
        assertEquals(ErrorCode.BOOKING_NOT_FOUND, exception.getErrorCode());

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verifyNoInteractions(invoiceRepo, vnPayConfig);
    }

    @Test
    void createVnPayPayment_WithNonExistentInvoice_ShouldThrowException() {
        // Arrange
        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.of(booking));
        when(invoiceRepo.findByBookingId(booking.getId())).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> vnPayService.createVnPayPayment(request));
        assertEquals(ErrorCode.INVOICE_NOT_FOUND, exception.getErrorCode());

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verify(invoiceRepo).findByBookingId(booking.getId());
        verifyNoInteractions(vnPayConfig);
    }

    @Test
    void createVnPayPayment_WithIncorrectAmount_ShouldThrowException() {
        // Arrange
        request.setParameter("amount", "2000000"); // Different from invoice amount
        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.of(booking));
        when(invoiceRepo.findByBookingId(booking.getId())).thenReturn(Optional.of(invoice));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> vnPayService.createVnPayPayment(request));
        assertEquals(ErrorCode.TOTAL_NOT_EQUAL, exception.getErrorCode());

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verify(invoiceRepo).findByBookingId(booking.getId());
        verifyNoInteractions(vnPayConfig);
    }

    @Test
    void savePayment_WithValidData_ShouldUpdateBookingAndRooms() {
        // Arrange
        request.setParameter("vnp_TxnRef", "BK-12345678");
        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.of(booking));
        when(roomRepo.findRoomsByBookingCode("BK-12345678")).thenReturn(Arrays.asList(room));
        when(bookingRepo.save(any(Booking.class))).thenReturn(booking);
        when(roomRepo.save(any(Room.class))).thenReturn(room);

        // Act
        vnPayService.savePayment(request);

        // Assert
        assertTrue(booking.getIsPaid());
        assertEquals(RoomStatus.AVAILABLE, room.getStatus());

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verify(roomRepo).findRoomsByBookingCode("BK-12345678");
        verify(bookingRepo).save(booking);
        verify(roomRepo).save(room);
    }

    @Test
    void savePayment_WithNonExistentBooking_ShouldThrowException() {
        // Arrange
        request.setParameter("vnp_TxnRef", "BK-12345678");
        when(bookingRepo.findByBookingCode("BK-12345678")).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> vnPayService.savePayment(request));
        assertEquals(ErrorCode.BOOKING_NOT_FOUND, exception.getErrorCode());

        verify(bookingRepo).findByBookingCode("BK-12345678");
        verifyNoInteractions(roomRepo);
    }
} 