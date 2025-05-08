package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
}
