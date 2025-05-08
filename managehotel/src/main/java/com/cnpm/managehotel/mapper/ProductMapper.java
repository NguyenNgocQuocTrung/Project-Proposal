package com.cnpm.managehotel.mapper;

import com.cnpm.managehotel.dto.ProductDTO;
import com.cnpm.managehotel.entity.Product;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mappings({
            @Mapping(source = "category.id", target = "categoryId"),
            @Mapping(source = "id", target = "id")
    })
    ProductDTO toDTO(Product product);


    @Mapping(target = "category", ignore = true)
    Product toEntity(ProductDTO dto);

    List<ProductDTO> toDTOList(List<Product> products);

    List<Product> toEntityList(List<ProductDTO> dtos);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category", ignore = true)
    void updateEntity(ProductDTO dto, @MappingTarget Product entity);
}
