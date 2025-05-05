package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepo extends JpaRepository<Feedback, Long> {
}
