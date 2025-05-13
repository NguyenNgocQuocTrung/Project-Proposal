package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication API", description = "APIs for authentication")
public class AuthController {

    private final AuthService authService;

    @ExceptionHandler(AppException.class)
    public ApiResponse<Void> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        return ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
    }

    @PostMapping("/register")
    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account with the provided information. Email and password are required. " +
                    "The password will be securely encrypted before saving. Duplicate usernames or emails are not allowed."
    )
    public ApiResponse<Void> register(@RequestBody UserDTO request){

        authService.register(request);

        return ApiResponse.<Void>builder()
                .build();
    }
}
