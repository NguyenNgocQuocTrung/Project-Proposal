package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.request.InvoiceRequest;
import com.cnpm.managehotel.dto.response.InvoiceResponse;


public interface InvoiceService {
    InvoiceResponse preview(String bookingCode);
}
