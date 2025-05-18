package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidatedTokenRepo extends JpaRepository<InvalidatedToken, String> {

}
