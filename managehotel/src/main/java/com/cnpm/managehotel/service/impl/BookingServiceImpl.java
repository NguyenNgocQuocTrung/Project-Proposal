package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.BookingdetailDTO;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.IdentityRequest;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.dto.response.CheckinResponse;
import com.cnpm.managehotel.entity.Booking;
import com.cnpm.managehotel.entity.BookingDetail;
import com.cnpm.managehotel.entity.Room;
import com.cnpm.managehotel.entity.User;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.BookingMapper;
import com.cnpm.managehotel.mapper.RoomMapper;
import com.cnpm.managehotel.mapper.UserMapper;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.BookingdetailRepo;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.repository.UserRepo;
import com.cnpm.managehotel.service.BookingService;
import com.cnpm.managehotel.service.BookingdetailService;
import com.cnpm.managehotel.service.RoomService;
import com.cnpm.managehotel.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepo bookingRepo;
    private final BookingdetailRepo bookingdetailRepo;
    private final RoomRepo roomRepo;
    private final UserRepo userRepo;

    private final BookingMapper bookingMapper;
    private final RoomMapper roomMapper;
    private final UserMapper userMapper;

    private final BookingdetailService bookingdetailService;
    private final RoomService roomService;
    private final UserService userService;

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

        Optional<User> optionalUser = userRepo.findByIdentityNumber(request.getIdentityNumber());

        User user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            UserDTO userDto = new UserDTO();
            userDto.setFullName(request.getFullName());
            userDto.setPhoneNumber(request.getPhoneNumber());
            userDto.setAddress(request.getAddress());
            userDto.setIdentityNumber(request.getIdentityNumber());
            userDto.setGender(request.getGender());
            userDto.setNationality(request.getNationality());

            user = userMapper.toEntity(userService.save(userDto));
        }

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

    @Override
    public CheckinResponse checkIn(IdentityRequest request) {
        User user = userRepo.findByIdentityNumber(request.getIdentityNumber())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Booking> bookings = bookingRepo.findByUserId(user.getId());

        Booking bookingToday = bookings.stream()
                .filter(b -> LocalDate.now().equals(
                        b.getCheckIn().toInstant()
                                .atZone(ZoneId.systemDefault())
                                .toLocalDate()
                ))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        List<BookingDetail> details = bookingdetailRepo.findByBookingId(bookingToday.getId());

        List<RoomDTO> rooms = new ArrayList<>();

        for (BookingDetail detail : details) {
            Room roomEntity = detail.getRoom();
            if (!RoomStatus.BOOKED.equalsIgnoreCase(roomEntity.getStatus())) {
                throw new AppException(ErrorCode.ROOM_IN_USE);
            }
            roomEntity.setStatus(RoomStatus.OCCUPIED);

            RoomDTO roomDto = roomMapper.toDTO(roomEntity);
            roomDto = roomService.save(roomDto);

            rooms.add(roomDto);
        }

        CheckinResponse response = new CheckinResponse();
        response.setBookingId(bookingToday.getId());
        response.setCustomerName(user.getFullName());
        response.setRooms(rooms);
        response.setCheckInTime(LocalDateTime.now());
        return response;
    }

    @Override
    public BookingResponse findUnpaidBooking(IdentityRequest request) {
        User user = userRepo.findByIdentityNumber(request.getIdentityNumber())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Booking> bookings = bookingRepo.findByUserIdAndIsPaidFalse(user.getId());

        List<BookingResponse> listResponse = new ArrayList<>();

        for(Booking booking : bookings){
            BookingResponse bookingResponse = bookingMapper.toDto(booking);
            listResponse.add(bookingResponse);
        }

        BookingResponse response = new BookingResponse();
        response.setListResult(listResponse);
        return response;
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
