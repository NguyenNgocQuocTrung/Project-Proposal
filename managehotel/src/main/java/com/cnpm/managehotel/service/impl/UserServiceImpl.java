package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.dto.UserDTO;
import com.cnpm.managehotel.entity.User;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.UserMapper;
import com.cnpm.managehotel.repository.UserRepo;
import com.cnpm.managehotel.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;

    private final UserMapper userMapper;

    @Override
    public UserDTO save(UserDTO dto) {
        User user;

        if(userRepo.existsByEmail(dto.getEmail()) && dto.getEmail() != null && !dto.getEmail().isEmpty()){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        if(dto.getIdentityNumber() != null && !dto.getIdentityNumber().isEmpty() && userRepo.existsByIdentityNumber(dto.getIdentityNumber())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        if (dto.getId() != null) {
            user = userRepo.findById(dto.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            userMapper.updateUser(dto, user);
        } else {
            user = userMapper.toEntity(dto);
        }

        User saved = userRepo.save(user);

        return userMapper.toDTO(saved);
    }

}
