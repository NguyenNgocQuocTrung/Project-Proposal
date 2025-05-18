package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
@Tag(name = "Room API", description = "APIs for managing hotel rooms")
public class RoomController {

    private final RoomService roomService;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return new ResponseEntity<>(response, errorCode.getStatusCode());
    }

    @GetMapping("/available")
    @Operation(
            summary = "Get all available rooms",
            description = "Retrieves a list of all rooms that are currently available for booking."
    )
    public ApiResponse<RoomDTO> getAllRoomAvailable(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                                        Date checkinDate,
                                                    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                                        Date checkoutDate) {
        RoomDTO availableRooms = roomService.findAllAvailable(checkinDate, checkoutDate);

        return ApiResponse.<RoomDTO>builder()
                .result(availableRooms)
                .build();
    }

    @GetMapping
    @Operation(
            summary = "Get all rooms",
            description = "Retrieves a list of all available rooms."
    )
    public ApiResponse<RoomDTO> getAllRoom(){
        RoomDTO response = roomService.findAll();

        return ApiResponse.<RoomDTO>builder()
                .result(response)
                .build();
    }

    @GetMapping
    @Operation(
            summary = "Get all rooms occupied",
            description = "Retrieves a list of all occupied rooms."
    )
    public ApiResponse<RoomDTO> getAllRoomOccupied(){
        RoomDTO response = roomService.findAllOccupide();

        return ApiResponse.<RoomDTO>builder()
                .result(response)
                .build();
    }

    @PostMapping
    @Operation(
            summary = "Create new room",
            description = "Creates a new room entry with the provided data."
    )
    public ApiResponse<RoomDTO> createRoom(@RequestBody RoomDTO request){
        RoomDTO respone = roomService.save(request);

        return ApiResponse.<RoomDTO>builder()
                .result(respone)
                .build();
    }

    @PutMapping
    @Operation(
            summary = "Update room information",
            description = "Updates the details of an existing room."
    )
    public ApiResponse<RoomDTO> updateRoom(@RequestBody RoomDTO request){
        RoomDTO response = roomService.save(request);

        return ApiResponse.<RoomDTO>builder()
                .result(response)
                .build();
    }

    @DeleteMapping
    @Operation(
            summary = "Delete rooms",
            description = "Deletes one or more rooms based on room numbers."
    )
    public ApiResponse<Void> deleteRoom(@RequestBody int[] roomNo){
        roomService.delete(roomNo);

        return ApiResponse.<Void>builder()
                .build();
    }
}
