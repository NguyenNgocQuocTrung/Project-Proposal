package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.response.ReportResponse;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.InvoiceRepo;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {


    private final BookingRepo bookingRepo;

    private final  RoomRepo roomRepo;

    private final InvoiceRepo invoiceRepo;

    @Override
    public ReportResponse getReportData() {
        int totalRooms = roomRepo.countTotalRooms();
        int bookedRooms = bookingRepo.countBookedRooms();

        double occupancyRate = totalRooms == 0 ? 0 : (bookedRooms * 100.0) / totalRooms;

        Double revenue = invoiceRepo.getRevenueByMonth(LocalDate.now().getMonthValue(), LocalDate.now().getYear());
        revenue = revenue == null ? 0 : revenue;

        int upcomingCheckIns = bookingRepo.countByCheckInAfter(new Date());
        int pendingCheckOuts = bookingRepo.countByCheckOutAfter(new Date());

        int roomsInMaintenance = roomRepo.countByStatus(RoomStatus.MAINTAIN);

        Integer totalGuests = bookingRepo.getTotalGuestsNow();
        totalGuests = totalGuests == null ? 0 : totalGuests;

        return new ReportResponse(
                occupancyRate,
                revenue,
                upcomingCheckIns,
                pendingCheckOuts,
                totalGuests,
                roomsInMaintenance
        );
    }
}
