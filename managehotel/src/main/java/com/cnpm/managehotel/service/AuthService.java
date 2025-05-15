package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.UserDTO;

public interface AuthService {
    void register(UserDTO request);
}
