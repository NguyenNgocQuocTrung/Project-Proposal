package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepo extends JpaRepository<ServiceEntity, Long> {
}
