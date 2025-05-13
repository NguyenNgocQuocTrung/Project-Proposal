package com.cnpm.managehotel.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Entity
@Table(name = "booking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "check_in")
    Date checkIn;

    @Column(name = "check_out")
    Date checkOut;

    @Column(name = "guest_num")
    int guestNum;

    @Column(name = "is_paid")
    Boolean isPaid = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @OneToMany(mappedBy = "booking")
    List<BookingDetail> bookingDetails = new ArrayList<>();

    @OneToMany(mappedBy = "booking")
    List<ServiceEntity> services = new ArrayList<>();

}
