package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.dto.response.PaymentResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.VnPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "VnPay API", description = "APIs for payment use VnPay")
public class VnPayController {

    private final VnPayService vnPayService;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return new ResponseEntity<>(response, errorCode.getStatusCode());
    }

    @GetMapping("/vn-pay")
    @Operation(
            summary = "Create VNPay payment",
            description = "Create a VNPay payment"
    )
    public ApiResponse<PaymentResponse> createPayment(@Parameter(description = "Payment amount") @RequestParam int amount,
                                                      @Parameter(description = "Bank code") @RequestParam String bankCode,
                                                      @Parameter(description = "Booking code") @RequestParam String bookingCode,
                                                      HttpServletRequest request){
        PaymentResponse response = vnPayService.createVnPayPayment(request);

        return ApiResponse.<PaymentResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/vn-pay-callback")
    public ApiResponse<Void> vnPayCallBackHandler(HttpServletRequest request,
                                                  @RequestParam String vnp_ResponseCode){
        String status = request.getParameter("vnp_ResponseCode");
        if(status.equals("00")){
            vnPayService.savePayment(request);
            return ApiResponse.<Void>builder()
                    .build();
        }else{
            return ApiResponse.<Void>builder()
                    .code(99)
                    .message("Fail")
                    .build();
        }

    }


}
