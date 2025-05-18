package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.config.TestSecurityConfig;
import com.cnpm.managehotel.dto.response.PaymentResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.service.VnPayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VnPayController.class)
@Import(TestSecurityConfig.class)
class VnPayControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VnPayService vnPayService;

    private PaymentResponse paymentResponse;

    @BeforeEach
    void setUp() {
        paymentResponse = PaymentResponse.builder()
                .URL("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1000000&vnp_Command=pay&...")
                .build();
    }

    @Test
    void createPayment_WithValidData_ShouldReturnPaymentUrl() throws Exception {
        // Arrange
        when(vnPayService.createVnPayPayment(any())).thenReturn(paymentResponse);

        // Act & Assert
        mockMvc.perform(get("/vn-pay")
                .param("amount", "1000000")
                .param("bankCode", "NCB")
                .param("bookingCode", "BK-12345678"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.result.URL").value(paymentResponse.getURL()));

        verify(vnPayService).createVnPayPayment(any());
    }

    @Test
    void createPayment_WithInvalidBooking_ShouldReturnError() throws Exception {
        // Arrange
        when(vnPayService.createVnPayPayment(any()))
                .thenThrow(new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Act & Assert
        mockMvc.perform(get("/vn-pay")
                .param("amount", "1000000")
                .param("bankCode", "NCB")
                .param("bookingCode", "INVALID-CODE"))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCode.BOOKING_NOT_FOUND.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.BOOKING_NOT_FOUND.getMessage()));

        verify(vnPayService).createVnPayPayment(any());
    }

    @Test
    void vnPayCallback_WithSuccessfulPayment_ShouldReturnSuccess() throws Exception {
        // Arrange
        doNothing().when(vnPayService).savePayment(any());

        // Act & Assert
        mockMvc.perform(get("/vn-pay-callback")
                .param("vnp_ResponseCode", "00")
                .param("vnp_TxnRef", "BK-12345678"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1000))
                .andExpect(jsonPath("$.message").value("Success"));

        verify(vnPayService).savePayment(any());
    }

    @Test
    void vnPayCallback_WithFailedPayment_ShouldReturnError() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/vn-pay-callback")
                .param("vnp_ResponseCode", "99")
                .param("vnp_TxnRef", "BK-12345678"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(99))
                .andExpect(jsonPath("$.message").value("Fail"));

        verifyNoInteractions(vnPayService);
    }
} 