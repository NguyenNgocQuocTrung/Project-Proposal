package com.cnpm.managehotel.mapper;

import com.cnpm.managehotel.dto.BookingdetailDTO;
import com.cnpm.managehotel.entity.BookingDetail;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface BookingdetailMapper {

    @Mapping(source = "bookingId", target = "booking.id")
    @Mapping(source = "roomId", target = "room.id")
    BookingDetail toEntity(BookingdetailDTO dto);

    @Mapping(source = "booking.id", target = "bookingId")
    @Mapping(source = "room.id", target = "roomId")
    BookingdetailDTO toDTO(BookingDetail entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "bookingId", target = "booking.id")
    @Mapping(source = "roomId", target = "room.id")
    void updateEntity(BookingdetailDTO dto, @MappingTarget BookingDetail entity);
}
