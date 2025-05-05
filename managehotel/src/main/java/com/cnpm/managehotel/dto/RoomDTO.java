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
public class RoomDTO extends AbstractDTO<RoomDTO>{
    int roomNo;
    String type;
    double price;
    int maxNum;
    String status;
}
