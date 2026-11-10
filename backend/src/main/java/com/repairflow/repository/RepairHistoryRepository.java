package com.repairflow.repository;

import com.repairflow.entity.RepairHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepairHistoryRepository extends JpaRepository<RepairHistory, Long> {
    List<RepairHistory> findByRepairIdOrderByCreatedAtDesc(Long repairId);
    void deleteByUpdatedById(Long userId);
    void deleteByRepairId(Long repairId);
}
