
package com.repairflow.dto;

import com.repairflow.entity.RepairHistory;
import com.repairflow.entity.RepairStatus;
import java.time.LocalDateTime;

public record HistoryResponse(
        Long id,
        RepairStatus status,
        String remarks,
        String updatedBy,
        LocalDateTime createdAt
) {
    public static HistoryResponse from(RepairHistory history) {
        return new HistoryResponse(
                history.id,
                history.status,
                history.remarks,
                history.updatedBy.name,
                history.createdAt
        );
    }
}
