package com.cnpm.managehotel.dto.response;

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
public class ServiceResponse extends AbstractDTO<ServiceResponse> {
    String productTitle;
    double price;
    int amount;
    double total;
}
