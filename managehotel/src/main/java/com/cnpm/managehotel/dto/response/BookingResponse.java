package com.cnpm.managehotel.dto.response;

import com.cnpm.managehotel.dto.AbstractDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Data
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse extends AbstractDTO<BookingResponse> {
    String bookingCode;
    String fullName;
    int guestNum;
    Date checkIn;
    Date checkOut;
}
