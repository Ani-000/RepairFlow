
package com.repairflow.dto;

import com.repairflow.entity.RepairStatus;

public record StatusUpdateRequest(
        RepairStatus status,
        String remarks
) {}
