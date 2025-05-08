package com.cnpm.managehotel.service;

import com.cnpm.managehotel.dto.FeedbackDTO;

public interface FeedbackService {
    FeedbackDTO save(FeedbackDTO request);
    FeedbackDTO findAll();
}
