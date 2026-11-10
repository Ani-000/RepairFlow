
package com.repairflow.dto;

public record RepairRequest(
        String deviceType,
        String deviceName,
        String problemDescription
) {}
