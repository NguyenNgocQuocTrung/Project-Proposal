package com.cnpm.managehotel.mapper;

import com.cnpm.managehotel.dto.request.BookingRequest;
import com.cnpm.managehotel.dto.response.BookingResponse;
import com.cnpm.managehotel.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookingDetails", ignore = true)
    @Mapping(target = "services", ignore = true)
    Booking toEntity(BookingRequest request);

    @Mapping(source = "user.fullName", target = "fullName")
    BookingResponse toDto(Booking booking);
}
