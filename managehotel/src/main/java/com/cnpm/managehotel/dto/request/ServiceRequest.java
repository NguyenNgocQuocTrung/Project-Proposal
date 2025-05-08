package com.cnpm.managehotel.dto.request;

import com.cnpm.managehotel.dto.AbstractDTO;
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
public class ServiceRequest extends AbstractDTO<ServiceRequest> {
    double price;
    int amount;
    Long productId;
    Long categoryId;
    int roomNo;
}
