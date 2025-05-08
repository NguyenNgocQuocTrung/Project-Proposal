package com.cnpm.managehotel.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user")
@Data
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
    String identiyNumber;

    String gender;
    String nationality;
    String password;

    @OneToMany(mappedBy = "user")
    List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    List<Feedback> feedbacks = new ArrayList<>();

}
