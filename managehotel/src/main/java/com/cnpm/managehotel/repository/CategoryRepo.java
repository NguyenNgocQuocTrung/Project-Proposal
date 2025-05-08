package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepo extends JpaRepository<Category, Long> {

}
