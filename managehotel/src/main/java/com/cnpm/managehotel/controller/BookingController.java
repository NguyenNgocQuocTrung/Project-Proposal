package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.BookingdetailDTO;
import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.CheckinRequest;
import com.cnpm.managehotel.dto.request.IdentityRequest;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.dto.response.CheckinResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.BookingService;
import com.cnpm.managehotel.service.BookingdetailService;
import com.cnpm.managehotel.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
@Tag(name = "Booking API", description = "APIs for managing hotel bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingdetailService bookingdetailService;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return new ResponseEntity<>(response, errorCode.getStatusCode());
    }

    @PostMapping
    @Operation(
            summary = "Create a new booking",
            description = "Creates a new hotel booking with the provided booking request data."
    )
    public ApiResponse<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        BookingResponse response = bookingService.save(request);

        return ApiResponse.<BookingResponse>builder()
                .result(response)
                .build();
    }

    @DeleteMapping
    @Operation(
            summary = "Delete bookings",
            description = "Deletes one or more bookings by their IDs."
    )
    public ApiResponse<Void> deteleBooking(@RequestBody String[] bookingCodes){
        bookingService.delete(bookingCodes);

        return ApiResponse.<Void>builder()
                .build();
    }

    @Operation(
            summary = "Get all booking in this month",
            description = "Allows employee can watch all booking in this month"
    )
    @GetMapping
    public ApiResponse<BookingResponse> getAllInCurrentMonth(){
        BookingResponse response = bookingService.findAll();

        return ApiResponse.<BookingResponse>builder()
                .result(response)
                .build();
    }

    @Operation(
            summary = "Check-in using identity number",
            description = "Allows a guest to check in if there is a valid booking and the room is available"
    )
    @PostMapping("/checkin")
    public ApiResponse<CheckinResponse> checkIn(@RequestBody CheckinRequest request) {
        CheckinResponse response = bookingService.checkIn(request);

        return ApiResponse.<CheckinResponse>builder()
                .result(response)
                .build();
    }

    @PostMapping("/unpaid")
    @Operation(
            summary = "Find unpaid bookings by identity number",
            description = "Returns a list of bookings that have not been paid, based on the customer's identity number (CMND/CCCD)"
    )
    public ApiResponse<BookingResponse> getUnpaidBookings(@RequestBody IdentityRequest request) {
        BookingResponse response = bookingService.findUnpaidBooking(request);
        return ApiResponse.<BookingResponse>builder()
                .result(response)
                .build();
    }

    @Operation(
            summary = "Get rooms by booking code",
            description = "Retrieve a list of rooms associated with the provided booking code"
    )
    @GetMapping("/{bookingCode}/detail")
    public ApiResponse<BookingdetailDTO> getRoomsByBookingCode(@PathVariable String bookingCode) {

        BookingdetailDTO response = bookingdetailService.findAllBookingdetailByBooking(bookingCode);

        return ApiResponse.<BookingdetailDTO>builder()
                .result(response)
                .build();
    }
}
