package com.cnpm.managehotel.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceResponse {
    String customerName;
    String customerPhone;

    Date checkIn;
    Date checkOut;
    int nightCount;

    String roomNo;
    List<ServiceResponse> services;

    private double roomTotal;
    private double serviceTotal;
    private double totalAmount;

    private String paymentStatus;
}
