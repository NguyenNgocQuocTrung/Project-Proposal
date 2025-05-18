package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceRepo extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByBookingId(Long id);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE MONTH(i.paidAt) = :month AND YEAR(i.paidAt) = :year")
    Double getRevenueByMonth(@Param("month") int month, @Param("year") int year);
}
