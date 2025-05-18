package com.cnpm.managehotel.controller;

import com.cnpm.managehotel.dto.response.ApiResponse;
import com.cnpm.managehotel.dto.response.ReportResponse;
import com.cnpm.managehotel.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
@Tag(name = "Report API", description = "View report of hotel")
public class ReportController {

    private final ReportService reportService;

    @Operation(
            summary = "Get dashboard report data",
            description = "Returns aggregated metrics such as occupancy rate, revenue, upcoming check-ins and check-outs, total guests, and rooms in maintenance"
    )
    @GetMapping
    public ApiResponse<ReportResponse> getDashboardReport() {
        ReportResponse report = reportService.getReportData();
        return ApiResponse.<ReportResponse>builder()
                .result(report)
                .build();
    }
}
