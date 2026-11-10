package com.repairflow.repository;

import com.repairflow.entity.Repair;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface RepairRepository extends JpaRepository<Repair, Long> {
    Optional<Repair> findByTicketId(String ticketId);
    List<Repair> findByCustomerId(Long customerId);
    List<Repair> findByTechnicianId(Long technicianId);
}