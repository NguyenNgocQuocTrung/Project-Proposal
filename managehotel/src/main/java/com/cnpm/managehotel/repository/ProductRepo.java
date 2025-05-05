package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepo extends JpaRepository<Product, Long> {
}
