package com.cnpm.managehotel.mapper;

import com.cnpm.managehotel.dto.RoomDTO;
import com.cnpm.managehotel.entity.Room;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    @Mapping(target = "id", source = "id")
    RoomDTO toDTO(Room entity);

    @Mapping(target = "id", source = "id")
    Room toEntity(RoomDTO dto);

    @Mapping(target = "id", source = "id")
    List<RoomDTO> toListDTO(List<Room> entities);

    @Mapping(target = "id", source = "id")
    List<Room> toListEntity(List<RoomDTO> dtos);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", source = "id")
    void updateEntity(RoomDTO dto, @MappingTarget Room entity);
}
