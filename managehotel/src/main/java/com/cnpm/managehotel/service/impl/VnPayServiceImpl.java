package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.config.VnPayConfig;
import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.response.PaymentResponse;
import com.cnpm.managehotel.entity.Booking;
import com.cnpm.managehotel.entity.Invoice;
import com.cnpm.managehotel.entity.Room;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.RoomMapper;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.InvoiceRepo;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.service.RoomService;
import com.cnpm.managehotel.service.VnPayService;
import com.cnpm.managehotel.util.VnPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VnPayServiceImpl implements VnPayService {

    private final VnPayConfig vnPayConfig;

    private final BookingRepo bookingRepo;

    private final InvoiceRepo invoiceRepo;

    private final RoomRepo  roomRepo;



    @Override
    public PaymentResponse createVnPayPayment(HttpServletRequest request) {
        String bookingCode = request.getParameter("bookingCode");
        double totalAmount = Double.parseDouble(request.getParameter("amount"));

        Booking booking = bookingRepo.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Invoice invoice = invoiceRepo.findByBookingId(booking.getId())
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND));

        if(totalAmount != invoice.getTotalAmount()){
            throw new AppException(ErrorCode.TOTAL_NOT_EQUAL);
        }

        long amount = Integer.parseInt(request.getParameter("amount")) * 100L;
        String bankCode = request.getParameter("bankCode");
        Map<String, String> vnpParamsMap = vnPayConfig.getVNPayConfig();
        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
        if (bankCode != null && !bankCode.isEmpty()) {
            vnpParamsMap.put("vnp_BankCode", bankCode);
        }
        vnpParamsMap.put("vnp_IpAddr", VnPayUtil.getIpAddress(request));
        vnpParamsMap.put("vnp_TxnRef", booking.getBookingCode());
        vnpParamsMap.put("vnp_OrderInfo","Thanh toan don hang:" + booking.getBookingCode());
        String queryUrl = VnPayUtil.getPaymentURL(vnpParamsMap, true);
        String hashData = VnPayUtil.getPaymentURL(vnpParamsMap, false);
        String vnpSecureHash = VnPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;

        return PaymentResponse.builder().URL(paymentUrl).build();
    }

    @Override
    public void savePayment(HttpServletRequest request) {
        String bookingCode = request.getParameter("vnp_TxnRef");

        Booking booking = bookingRepo.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        booking.setIsPaid(true);

        Invoice invoice = invoiceRepo.findByBookingId(booking.getId())
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND));

        List<Room> rooms = roomRepo.findRoomsByBookingCode(bookingCode);


        bookingRepo.save(booking);

        for (Room room : rooms) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepo.save(room);
        }
    }
}
