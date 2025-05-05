package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, Long> {
}
