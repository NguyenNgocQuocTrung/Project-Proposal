package com.cnpm.managehotel.mapper;

import com.cnpm.managehotel.dto.FeedbackDTO;
import com.cnpm.managehotel.entity.Feedback;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {

    @Mapping(source = "user.phoneNumber", target = "phoneNumber")
    @Mapping(source = "id", target = "id")
    FeedbackDTO toDto(Feedback feedback);

    @Mapping(source = "phoneNumber", target = "user.phoneNumber")
    @Mapping(source = "id", target = "id")
    Feedback toEntity(FeedbackDTO feedbackDto);

    @Mapping(source = "user.phoneNumber", target = "phoneNumber")
    @Mapping(source = "id", target = "id")
    List<FeedbackDTO> toListDTO(List<Feedback> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(FeedbackDTO dto, @MappingTarget Feedback entity);
}
