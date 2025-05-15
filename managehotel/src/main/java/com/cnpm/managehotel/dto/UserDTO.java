package com.cnpm.managehotel.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDTO extends AbstractDTO<UserDTO>{
    Long id;
    String fullName;
    String email;
    String password;
    String phoneNumber;
    String address;
    String identityNumber;
    String gender;
    String nationality;
}
