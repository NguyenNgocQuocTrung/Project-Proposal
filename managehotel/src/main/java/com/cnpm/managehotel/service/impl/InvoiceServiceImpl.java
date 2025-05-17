package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.InvoiceRequest;
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
import com.cnpm.managehotel.service.BookingService;
import com.cnpm.managehotel.service.InvoiceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final BookingRepo bookingRepo;
    private final BookingdetailRepo bookingdetailRepo;
    private final ServiceRepo serviceRepo;
    private final InvoiceRepo invoiceRepo;

    private final BookingMapper bookingMapper;




    @Override
    public InvoiceResponse preview(String bookingCode) {
        Booking booking = bookingRepo.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        User user = booking.getUser();
        List<BookingDetail> details = bookingdetailRepo.findByBookingId(booking.getId());
        List<ServiceEntity> services = serviceRepo.findByBookingId(booking.getId());

        int nightCount = (int) ChronoUnit.DAYS.between(
                booking.getCheckIn().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                booking.getCheckOut().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
        );

        double roomTotal = 0;
        String roomNos = "";

        for (BookingDetail detail : details) {
            Room room = detail.getRoom();
            double price = room.getPrice();
            roomTotal += price * detail.getUnit();

            roomNos += room.getRoomNo()+ ", ";
        }

        if (!roomNos.isEmpty()) {
            roomNos = roomNos.substring(0, roomNos.length() - 2);
        }

        List<ServiceResponse> serviceItems = services.stream().map(s -> {
            Product product = s.getProduct();
            double total = s.getAmount() * product.getPrice();
            return new ServiceResponse(product.getTitle(), s.getPrice(), s.getAmount(), total);
        }).toList();

        double serviceTotal = serviceItems.stream().mapToDouble(ServiceResponse::getTotal).sum();

        Invoice invoice = new Invoice();
        invoice.setTotalAmount(roomTotal + serviceTotal);
        invoice.setBooking(booking);

        invoiceRepo.save(invoice);

        return new InvoiceResponse(
                user.getFullName(),
                user.getPhoneNumber(),
                booking.getCheckIn(),
                booking.getCheckOut(),
                nightCount,
                roomNos,
                serviceItems,
                roomTotal,
                serviceTotal,
                roomTotal + serviceTotal,
                booking.getIsPaid() ? "Paid" : "Unpaid"
        );
    }
}
