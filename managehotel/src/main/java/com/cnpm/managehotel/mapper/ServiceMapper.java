package com.cnpm.managehotel.mapper;

import com.cnpm.managehotel.dto.request.ServiceRequest;
import com.cnpm.managehotel.dto.response.ServiceResponse;
import com.cnpm.managehotel.entity.ServiceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ServiceMapper {

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "buyDate", ignore = true)
    ServiceEntity toEntity(ServiceRequest request);

    @Mapping(source = "product.title", target = "productTitle")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = ".", target = "total", qualifiedByName = "calculateTotal")
    ServiceResponse toDTO(ServiceEntity entity);

    @Named("calculateTotal")
    static double calculateTotal(ServiceEntity entity) {
        return entity.getPrice() * entity.getAmount();
    }

}
