package com.cnpm.managehotel.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    String fullName;
    String phoneNumber;
    String identityNumber;
    String address;
    String gender;
    String nationality;
    int guestNum;
    Date checkIn;
    Date checkOut;
    int[] roomNo;
}
