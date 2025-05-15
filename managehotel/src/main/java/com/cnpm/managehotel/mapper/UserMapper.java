package com.cnpm.managehotel.mapper;

import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", source = "id")
    UserDTO toDTO(User user);

    @Mapping(target = "id", source = "id")
    User toEntity(UserDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUser(UserDTO dto, @MappingTarget User entity);
}
