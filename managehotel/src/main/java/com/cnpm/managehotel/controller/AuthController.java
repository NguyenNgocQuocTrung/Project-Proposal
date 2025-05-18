package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.dto.request.AuthenticationRequest;
import com.cnpm.managehotel.dto.request.IntrospectRequest;
import com.cnpm.managehotel.dto.request.LogoutRequest;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.dto.response.AuthenticationResponse;
import com.cnpm.managehotel.dto.response.IntrospectResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.AuthService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication API", description = "APIs for authentication")
public class AuthController {

    private final AuthService authService;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return new ResponseEntity<>(response, errorCode.getStatusCode());
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

    @PostMapping("/login")
    @Operation(
            summary = "User login",
            description = "Authenticate user credentials and return authentication token"
    )
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request){
        AuthenticationResponse response = authService.authenticate(request);

        return ApiResponse.<AuthenticationResponse>builder()
                .result(response)
                .build();
    }

    @PostMapping("/logout")
    @Operation(
            summary = "User logout",
            description = "Logs out a user by invalidating their refresh token or session."
    )
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

//    @PostMapping("/introspect")
//    @Operation(
//            summary = "Token introspection",
//            description = "Validate and retrieve details about an access token"
//    )
//    public ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
//            throws ParseException, JOSEException {
//        IntrospectResponse response = authService.introspect(request);
//        return ApiResponse.<IntrospectResponse>builder()
//                .result(response)
//                .build();
//    }
}
