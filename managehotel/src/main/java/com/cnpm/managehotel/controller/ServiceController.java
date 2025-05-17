package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.request.ServiceRequest;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.dto.response.ServiceResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/service")
@RequiredArgsConstructor
@Tag(name = "Service API", description = "APIs for managing hotel services")
public class ServiceController {

    private final ServiceService serviceService;

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
            summary = "Create a new service",
            description = "Creates a new hotel service using the provided service request data."
    )
    public ApiResponse<ServiceResponse> createService(@RequestBody ServiceRequest request){

        ServiceResponse response = serviceService.save(request);

        return ApiResponse.<ServiceResponse>builder()
                .result(response)
                .build();
    }

    @DeleteMapping
    @Operation(
            summary = "Cancel a service",
            description = "Deletes a booked service. If the service is a consumable item (category = 1), the product quantity will be restored to inventory."
    )
    public ApiResponse<Void> createService(@RequestBody Long[] ids){

       serviceService.delete(ids);
       return ApiResponse.<Void>builder()
                .build();
    }
}
