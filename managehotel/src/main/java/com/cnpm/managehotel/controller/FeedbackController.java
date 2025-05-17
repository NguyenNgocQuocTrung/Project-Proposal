package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.FeedbackDTO;
import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.exception.AppException;
import com.cnpm.managehotel.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.cnpm.managehotel.service.FeedbackService;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback API", description = "APIs for managing user feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return new ResponseEntity<>(response, errorCode.getStatusCode());
    }

    @GetMapping
    @Operation(
            summary = "Get all feedback",
            description = "Retrieves all feedback entries from the system."
    )
    public ApiResponse<FeedbackDTO> getAll(){
        FeedbackDTO response = feedbackService.findAll();
        return ApiResponse.<FeedbackDTO>builder()
                .result(response)
                .build();
    }

    @PostMapping
    @Operation(
            summary = "Create new feedback",
            description = "Submits new feedback provided by a user."
    )
    public ApiResponse<FeedbackDTO> create(@RequestBody FeedbackDTO request){
        FeedbackDTO response = feedbackService.save(request);

        return ApiResponse.<FeedbackDTO>builder()
                .result(response)
                .build();
    }

    @PutMapping
    @Operation(
            summary = "Update feedback",
            description = "Updates an existing feedback entry with new information."
    )
    public ApiResponse<FeedbackDTO> updateFeedback(@RequestBody FeedbackDTO request){
        FeedbackDTO response = feedbackService.save(request);

        return ApiResponse.<FeedbackDTO>builder()
                .result(response)
                .build();
    }

}
