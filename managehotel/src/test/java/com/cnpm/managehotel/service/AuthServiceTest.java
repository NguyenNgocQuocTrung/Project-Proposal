package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private UserDTO validUser;

    @BeforeEach
    void setUp() {
        validUser = UserDTO.builder()
                .email("test@example.com")
                .password("password123")
                .fullName("Test User")
                .phoneNumber("1234567890")
                .address("123 Test St")
                .identityNumber("ID123456")
                .gender("Male")
                .nationality("VN")
                .build();
    }

    @Test
    void register_WithValidData_ShouldSucceed() {
        // Arrange
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userService.save(any())).thenReturn(validUser);

        // Act
        assertDoesNotThrow(() -> authService.register(validUser));

        // Assert
        verify(passwordEncoder).encode("password123");
        verify(userService).save(any(UserDTO.class));
    }

    @Test
    void register_WithNullEmail_ShouldThrowException() {
        // Arrange
        validUser.setEmail(null);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.register(validUser));
        assertEquals("USERNAME_INVALID", exception.getErrorCode().name());
    }

    @Test
    void register_WithEmptyEmail_ShouldThrowException() {
        // Arrange
        validUser.setEmail("");

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.register(validUser));
        assertEquals("USERNAME_INVALID", exception.getErrorCode().name());
    }

    @Test
    void register_WithNullPassword_ShouldThrowException() {
        // Arrange
        validUser.setPassword(null);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.register(validUser));
        assertEquals("INVALID_PASSWORD", exception.getErrorCode().name());
    }

    @Test
    void register_WithEmptyPassword_ShouldThrowException() {
        // Arrange
        validUser.setPassword("");

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> authService.register(validUser));
        assertEquals("INVALID_PASSWORD", exception.getErrorCode().name());
    }
} 