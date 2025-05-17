package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.dto.response.InvoiceResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Tag(name = "Payment API", description = "APIs for payment")
public class InvoiceController {

    private final InvoiceService paymentService;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return new ResponseEntity<>(response, errorCode.getStatusCode());
    }

    @GetMapping("/{bookingCode}/invoice-preview")
    @Operation(
            summary = "Preview payment",
            description = "Return detail invoice"
    )
    public ApiResponse<InvoiceResponse> previewInvoice(@PathVariable String bookingCode) {
        InvoiceResponse response = paymentService.preview(bookingCode);
        return ApiResponse.<InvoiceResponse>builder()
                .result(response)
                .build();
    }
}
