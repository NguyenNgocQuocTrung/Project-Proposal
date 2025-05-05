package com.cnpm.managehotel.dto;


import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Data
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackDTO extends AbstractDTO<FeedbackDTO> {
    private String content;
    private Date submittedAt;
    private Long userId;
}
