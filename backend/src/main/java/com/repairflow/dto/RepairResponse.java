package com.repairflow.dto;

import com.repairflow.entity.Repair;
import com.repairflow.entity.RepairStatus;
import com.repairflow.entity.ApprovalStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RepairResponse(
        Long id,
        String ticketId,
        String customerName,
        String technicianName,
        String deviceType,
        String deviceName,
        String problemDescription,
        RepairStatus status,
        ApprovalStatus approvalStatus,
        BigDecimal estimatedCost,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static RepairResponse from(Repair repair) {
        return new RepairResponse(
                repair.id,
                repair.ticketId,
                repair.customer == null ? null : repair.customer.name,
                repair.technician == null ? null : repair.technician.name,
                repair.deviceType,
                repair.deviceName,
                repair.problemDescription,
                repair.status,
                repair.approvalStatus,
                repair.estimatedCost,
                repair.createdAt,
                repair.updatedAt
        );
    }
}
