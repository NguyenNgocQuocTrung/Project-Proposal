package com.cnpm.managehotel.repository;

import com.cnpm.managehotel.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceRepo extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByBookingId(Long id);
}
