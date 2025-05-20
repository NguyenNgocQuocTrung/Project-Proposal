package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.BookingdetailDTO;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.CheckinRequest;
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
import com.cnpm.managehotel.mapper.BookingdetailMapper;
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

import java.time.*;
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
    private final BookingdetailMapper bookingdetailMapper;

    private final BookingdetailService bookingdetailService;
    private final RoomService roomService;
    private final UserService userService;

    @Override
    public BookingResponse findAll() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        List<Booking> bookingEntities =bookingRepo.findAllByCheckInBetween(
                Date.from(startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant()),
                Date.from(endOfMonth.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant())
        );

        List<BookingResponse> listResult = new ArrayList<>();
        for(Booking bookingEntity : bookingEntities){
            BookingResponse bookingResponse = bookingMapper.toDto(bookingEntity);
            listResult.add(bookingResponse);
        }

        BookingResponse response = new BookingResponse();
        response.setListResult(listResult);

        return response;
    }

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
            dto.setPrice(room.getPrice());
            dto.setBookingId(savedBooking.getId());
            bookingdetailService.save(dto);
        });

        return bookingMapper.toDto(savedBooking);
    }

    @Override
    @Transactional
    public void delete(String[] bookingCodes) {
        List<String> bookingCodesList = Arrays.asList(bookingCodes);
        List<Booking> bookings = bookingRepo.findAllByBookingCodeIn(bookingCodesList);

        if (bookings.size() != bookingCodesList .size()) {
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }

        for (Booking booking : bookings) {
            bookingdetailService.delete(booking.getId(), RoomStatus.AVAILABLE);
            bookingRepo.delete(booking);
        }
    }

    @Override
    public CheckinResponse checkIn(CheckinRequest request) {

        Booking booking = bookingRepo.findByBookingCode(request.getBookingCode())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Room room = roomRepo.findByRoomNo(request.getRoomNo())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        BookingDetail detail = bookingdetailRepo.findByBookingIdAndRoomId(booking.getId(), room.getId());

        if(request.isForeign()){
            detail.setForeign(true);
        }

        if(request.isExtraFree()){
            detail.setExtraFee(0.25);
        }

        BookingdetailDTO detailDto = bookingdetailMapper.toDTO(detail);
        bookingdetailService.save(detailDto);

        if (!RoomStatus.AVAILABLE.equalsIgnoreCase(room.getStatus())) {
            throw new AppException(ErrorCode.ROOM_IN_USE);
        }
        room.setStatus(RoomStatus.OCCUPIED);

        RoomDTO roomDto = roomMapper.toDTO(room);
        roomDto = roomService.save(roomDto);

        CheckinResponse response = new CheckinResponse();
        response.setBookingCode(booking.getBookingCode());
        response.setCustomerName(booking.getUser().getFullName());
        response.setRoom(roomDto);
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

            if (RoomStatus.MAINTAIN.equalsIgnoreCase(room.getStatus())) {
                return false;
            }

            for (BookingDetail detail : room.getBookingDetails()) {
                Booking booking = detail.getBooking();
                if (booking == null)
                    continue;

                boolean overlaps = booking.getCheckOut().after(checkIn) && booking.getCheckIn().before(checkOut);
                if (overlaps) {
                    return false;
                }
            }
        }
        return true;
    }

}
