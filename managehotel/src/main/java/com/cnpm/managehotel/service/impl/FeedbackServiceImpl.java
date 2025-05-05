package com.cnpm.managehotel.service.impl;

import com.cnpm.managehotel.dto.FeedbackDTO;
import com.cnpm.managehotel.entity.Feedback;
import com.cnpm.managehotel.entity.User;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import com.cnpm.managehotel.mapper.FeedbackMapper;
import com.cnpm.managehotel.repository.FeedbackRepo;
import com.cnpm.managehotel.repository.UserRepo;
import com.cnpm.managehotel.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService{

    private final FeedbackMapper feedbackMapper;

    private final FeedbackRepo feedbackRepo;

    private final UserRepo userRepo;

    public FeedbackDTO save(FeedbackDTO request) {
        Feedback feedback;

        if (request.getId() != null) {
            feedback = feedbackRepo.findById(request.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));


            feedbackMapper.updateEntity(request, feedback);

        } else {
            feedback = feedbackMapper.toEntity(request);
        }

        if (request.getUserId() != null) {
            User user = userRepo.findById(request.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            feedback.setUser(user);
        }

        Feedback savedFeedback = feedbackRepo.save(feedback);
        return feedbackMapper.toDto(savedFeedback);
    }

    @Override
    public FeedbackDTO findAll() {
        List<Feedback> feedbacks = feedbackRepo.findAll();

        List<FeedbackDTO> feedbackDTOs = feedbackMapper.toListDTO(feedbacks);

        FeedbackDTO result = new FeedbackDTO();
        result.setListResult(feedbackDTOs);
        return result;
    }
}
