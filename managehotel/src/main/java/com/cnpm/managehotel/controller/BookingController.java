package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.request.IdentityRequest;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.dto.response.CheckinResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
@Tag(name = "Booking API", description = "APIs for managing hotel bookings")
public class BookingController {

    private final BookingService bookingService;

    @ExceptionHandler(AppException.class)
    public ApiResponse<Void> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        return ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
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
    public ApiResponse<Void> deteleBooking(@RequestBody Long[] ids){
        bookingService.delete(ids);

        return ApiResponse.<Void>builder()
                .build();
    }

    @Operation(
            summary = "Check-in using identity number",
            description = "Allows a guest to check in if there is a valid booking and the room is available"
    )
    @PostMapping("/checkin")
    public ApiResponse<CheckinResponse> checkIn(@RequestBody IdentityRequest request) {
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
}
