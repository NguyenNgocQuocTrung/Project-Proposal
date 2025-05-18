package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.entity.User;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.mapper.UserMapper;
import com.cnpm.managehotel.repository.UserRepo;
import com.cnpm.managehotel.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private UserDTO userDTO;
    private User user;

    @BeforeEach
    void setUp() {
        userDTO = UserDTO.builder()
                .fullName("John Doe")
                .email("john@example.com")
                .password("password123")
                .phoneNumber("1234567890")
                .address("123 Test St")
                .identityNumber("ID123456")
                .gender("Male")
                .nationality("US")
                .build();

        user = new User();
        user.setId(1L);
        user.setFullName("John Doe");
        user.setEmail("john@example.com");
        user.setPassword("password123");
        user.setPhoneNumber("1234567890");
        user.setAddress("123 Test St");
        user.setIdentityNumber("ID123456");
        user.setGender("Male");
        user.setNationality("US");
    }

    @Test
    void save_NewUser_Success() {
        // Arrange
        when(userRepo.existsByEmail(userDTO.getEmail())).thenReturn(false);
        when(userMapper.toEntity(userDTO)).thenReturn(user);
        when(userRepo.save(any(User.class))).thenReturn(user);
        when(userMapper.toDTO(user)).thenReturn(userDTO);

        // Act
        UserDTO result = userService.save(userDTO);

        // Assert
        assertNotNull(result);
        assertEquals(userDTO.getEmail(), result.getEmail());
        assertEquals(userDTO.getFullName(), result.getFullName());
        verify(userRepo).save(any(User.class));
    }

    @Test
    void save_ExistingUser_Success() {
        // Arrange
        userDTO.setId(1L);
        when(userRepo.existsByEmail(userDTO.getEmail())).thenReturn(false);
        when(userRepo.findById(userDTO.getId())).thenReturn(Optional.of(user));
        when(userRepo.save(any(User.class))).thenReturn(user);
        when(userMapper.toDTO(user)).thenReturn(userDTO);

        // Act
        UserDTO result = userService.save(userDTO);

        // Assert
        assertNotNull(result);
        assertEquals(userDTO.getId(), result.getId());
        assertEquals(userDTO.getEmail(), result.getEmail());
        verify(userMapper).updateUser(userDTO, user);
    }

    @Test
    void save_DuplicateEmail_ThrowsException() {
        // Arrange
        when(userRepo.existsByEmail(userDTO.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(AppException.class, () -> userService.save(userDTO));
        verify(userRepo, never()).save(any(User.class));
    }
} 