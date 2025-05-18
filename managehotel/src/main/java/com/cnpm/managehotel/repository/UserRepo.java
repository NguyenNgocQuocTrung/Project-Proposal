package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByIdentityNumber(String identityNumber);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByIdentityNumber(String indentityNumber);
    Optional<User> findByPhoneNumber(String phoneNumber);
}
