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
public class ProductDTO extends AbstractDTO<ProductDTO>{
    String title;
    String description;
    double price;
    int amount;
    Long categoryId;
    String categoryName;
}
