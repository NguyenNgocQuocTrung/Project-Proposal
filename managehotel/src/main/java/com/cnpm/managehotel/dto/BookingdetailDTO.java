package com.cnpm.managehotel.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingdetailDTO extends AbstractDTO<BookingdetailDTO>{
    Long bookingId;
    Long roomId;
    double price;
    int unit;
    boolean isForeign;
    double extraFee;
}
