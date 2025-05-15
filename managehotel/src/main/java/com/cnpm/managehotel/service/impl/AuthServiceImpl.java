package com.cnpm.managehotel.service.impl;


import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.AuthService;
import com.cnpm.managehotel.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void register(UserDTO request) {

        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            throw new AppException(ErrorCode.USERNAME_INVALID);
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        request.setPassword(passwordEncoder.encode(request.getPassword()));

        userService.save(request);
    }
}
