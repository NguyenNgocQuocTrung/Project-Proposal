package com.cnpm.managehotel.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckinRequest {
    String bookingCode;
    int roomNo;
    boolean isForeign;
    boolean extraFree;
}
