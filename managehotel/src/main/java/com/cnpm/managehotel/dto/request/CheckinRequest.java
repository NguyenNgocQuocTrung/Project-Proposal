package com.cnpm.managehotel.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
    boolean foreign;
    boolean extraFree;
}
