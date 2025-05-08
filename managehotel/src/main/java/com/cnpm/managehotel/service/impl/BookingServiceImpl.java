package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.BookingdetailDTO;
import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.entity.Booking;
import com.cnpm.managehotel.entity.BookingDetail;
import com.cnpm.managehotel.entity.Room;
import com.cnpm.managehotel.entity.User;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.BookingMapper;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.BookingdetailRepo;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.repository.UserRepo;
import com.cnpm.managehotel.service.BookingService;
import com.cnpm.managehotel.service.BookingdetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepo bookingRepo;
    private final BookingdetailRepo bookingdetailRepo;
    private final RoomRepo roomRepo;
    private final UserRepo userRepo;
    private final BookingMapper bookingMapper;

    private final BookingdetailService bookingdetailService;


    @Override
    @Transactional
    public BookingResponse save(BookingRequest request) {
        if(request.getCheckOut().before(request.getCheckIn())){
            throw new AppException(ErrorCode.INVALID_DATE);
        }

        List<Room> rooms = roomRepo.findByRoomNoIn(
                Arrays.stream(request.getRoomNo()).boxed().collect(Collectors.toList())
        );

        if (rooms.size() != request.getRoomNo().length) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }

        if (!areRoomsAvailable(rooms, request.getCheckIn(), request.getCheckOut())) {
            throw new AppException(ErrorCode.ROOM_IN_USE);
        }

        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        int unit = (int) ChronoUnit.DAYS.between(
                request.getCheckIn().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                request.getCheckOut().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
        );

        Booking booking = bookingMapper.toEntity(request);
        booking.setUser(user);

        Booking savedBooking = bookingRepo.save(booking);

        rooms.forEach(room -> {
            BookingdetailDTO dto = new BookingdetailDTO();
            dto.setRoomId(room.getId());
            dto.setUnit(unit);
            dto.setBookingId(savedBooking.getId());
            dto.setStatus(RoomStatus.BOOKED);
            bookingdetailService.save(dto);
        });

        return bookingMapper.toDto(savedBooking);
    }

    @Override
    @Transactional
    public void delete(Long[] ids) {
        List<Long> idList = Arrays.asList(ids);
        List<Booking> bookings = bookingRepo.findAllById(idList);

        if (bookings.size() != idList.size()) {
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }

        for (Booking booking : bookings) {
            bookingdetailService.delete(booking.getId(), RoomStatus.AVAILABLE);
            bookingRepo.delete(booking);
        }
    }

    private boolean areRoomsAvailable(List<Room> rooms, Date checkIn, Date checkOut) {
        for (Room room : rooms) {
            if (!RoomStatus.AVAILABLE.equalsIgnoreCase(room.getStatus())) {
                return false;
            }

            for (BookingDetail detail : room.getBookingDetails()) {
                Booking booking = detail.getBooking();
                if (booking == null) continue;

                boolean overlaps = !(booking.getCheckOut().before(checkIn) || booking.getCheckIn().after(checkOut));
                if (overlaps) {
                    return false;
                }
            }
        }
        return true;
    }

}
