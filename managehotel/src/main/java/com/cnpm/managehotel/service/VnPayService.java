package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.response.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface VnPayService {
    PaymentResponse createVnPayPayment(HttpServletRequest request);
    void savePayment(HttpServletRequest request);
}
