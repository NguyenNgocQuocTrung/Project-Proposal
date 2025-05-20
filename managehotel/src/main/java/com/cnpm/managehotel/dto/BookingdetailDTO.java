package com.cnpm.managehotel.dto;

import com.cnpm.managehotel.dto.response.BookingResponse;
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
    BookingResponse booking;
    Long roomId;
    double price;
    int unit;
    boolean foreign;
    double extraFee;
    RoomDTO room;
}
