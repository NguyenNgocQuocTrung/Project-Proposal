package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.config.TestSecurityConfig;
import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(TestSecurityConfig.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

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
    void register_WithValidData_ShouldRegisterUser() throws Exception {
        doNothing().when(authService).register(any(UserDTO.class));

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validUser)))
                .andDo(print())  // This will print the request/response details
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"));
    }

    @Test
    void register_WithEmptyPassword_ShouldReturnError() throws Exception {
        validUser.setPassword("");
        doThrow(new AppException(ErrorCode.INVALID_PASSWORD))
                .when(authService).register(any(UserDTO.class));

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validUser)))
                .andDo(print())
                .andExpect(status().isBadRequest())  // HTTP 400
                .andExpect(jsonPath("$.code").value(1004))  // INVALID_PASSWORD code
                .andExpect(jsonPath("$.message").value("Password must be at least {min} characters"));
    }
} 