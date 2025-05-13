package com.cnpm.managehotel.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoice")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    Booking booking;

    @Column(name = "room_amount", nullable = false)
    double roomAmount;

    @Column(name = "service_amount", nullable = false)
    double serviceAmount;

    @Column(name = "total_amount", nullable = false)
    double totalAmount;

    @Column(name = "paid_at")
    LocalDateTime paidAt;

    @Column(name = "created_at")
    @CreatedDate
    LocalDateTime createdAt;
}
