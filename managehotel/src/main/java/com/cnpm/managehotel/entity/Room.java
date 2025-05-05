package com.cnpm.managehotel.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "room_no", unique = true)
    int roomNo;

    char type;

    double price;

    @Column(name = "max_num")
    int maxNum;

    String status;

    @OneToMany(mappedBy = "room")
    List<BookingDetail> bookingDetails = new ArrayList<>();

}
