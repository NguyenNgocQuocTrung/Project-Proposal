package com.cnpm.managehotel.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Builder
@Data
@Entity
@Table(name = "user")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "full_name")
    String fullName;
    String email;

    @Column(name = "phone_number")
    String phoneNumber;
    String address;

    @Column(name = "identity_number")
    String identityNumber;

    String gender;
    String nationality;
    String password;
    String role;

    @OneToMany(mappedBy = "user")
    List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    List<Feedback> feedbacks = new ArrayList<>();

}
