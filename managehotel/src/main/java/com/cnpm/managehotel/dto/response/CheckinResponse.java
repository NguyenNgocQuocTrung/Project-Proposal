package com.cnpm.managehotel.dto.response;

import com.cnpm.managehotel.dto.RoomDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckinResponse {
    Long bookingId;
    String customerName;
    LocalDateTime checkInTime;
    String status;
    List<RoomDTO> rooms;
}
