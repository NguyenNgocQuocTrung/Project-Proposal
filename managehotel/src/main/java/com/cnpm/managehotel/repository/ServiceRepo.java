package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepo extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByBookingId(Long id);
}
