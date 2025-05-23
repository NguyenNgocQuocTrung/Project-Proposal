package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.constant.RoomStatus;
import com.cnpm.managehotel.dto.BookingdetailDTO;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.entity.Booking;
import com.cnpm.managehotel.entity.BookingDetail;
import com.cnpm.managehotel.entity.Room;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.BookingMapper;
import com.cnpm.managehotel.mapper.BookingdetailMapper;
import com.cnpm.managehotel.mapper.RoomMapper;
import com.cnpm.managehotel.repository.BookingRepo;
import com.cnpm.managehotel.repository.BookingdetailRepo;
import com.cnpm.managehotel.repository.RoomRepo;
import com.cnpm.managehotel.service.BookingdetailService;
import com.cnpm.managehotel.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingdetailServiceImpl implements BookingdetailService {
    private final BookingdetailRepo bookingDetailRepo;

    private final BookingRepo bookingRepo;

    private final RoomRepo roomRepo;

    private final RoomMapper roomMapper;

    private final BookingdetailMapper bookingDetailMapper;

    private final BookingMapper bookingMapper;

    private final RoomService roomService;

    @Override
    @Transactional
    public BookingdetailDTO save(BookingdetailDTO request) {
        Booking booking = bookingRepo.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Room room = roomRepo.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        BookingDetail entity;

        if (request.getId() != null) {
            entity = bookingDetailRepo.findById(request.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
            bookingDetailMapper.updateEntity(request, entity);
        } else {
            entity = bookingDetailMapper.toEntity(request);
        }

        entity.setBooking(booking);
        entity.setRoom(room);

        BookingDetail saved = bookingDetailRepo.save(entity);

        return bookingDetailMapper.toDTO(saved);
    }

    @Override
    public void delete(Long id, String status) {
        List<BookingDetail> details = bookingDetailRepo.findByBookingId(id);
        for (BookingDetail detail : details) {
            Room room = detail.getRoom();
            RoomDTO dto = roomMapper.toDTO(room);
            dto.setStatus(status);
            if (room != null) {
                roomService.save(dto);
            }
        }
        bookingDetailRepo.deleteAll(details);
    }

    public BookingdetailDTO findAllBookingdetailByBooking(String bookingCode){

        Booking booking = bookingRepo.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        BookingResponse bookingResponse = bookingMapper.toDto(booking);

        List<BookingdetailDTO> listResult = new ArrayList<>();

        for(BookingDetail detail : booking.getBookingDetails()){

            BookingdetailDTO detailDto = bookingDetailMapper.toDTO(detail);

            RoomDTO roomDto = roomMapper.toDTO(detail.getRoom());

            detailDto.setRoom(roomDto);

            listResult.add(detailDto);
        }
        BookingdetailDTO response = new BookingdetailDTO();
        response.setListResult(listResult);
        response.setBooking(bookingResponse);

        return response;
    }
}
