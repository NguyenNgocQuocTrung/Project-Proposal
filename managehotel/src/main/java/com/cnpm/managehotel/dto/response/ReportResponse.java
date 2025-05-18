package com.cnpm.managehotel.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportResponse {
    double occupancyRate;
    double revenue;
    int upcomingCheckIns;
    int pendingCheckOuts;
    int totalGuests;
    int roomsInMaintenance;
}
