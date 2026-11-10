package com.repairflow.entity;

public enum RepairStatus {
    RECEIVED,
    DIAGNOSING,
    AWAITING_APPROVAL,
    IN_REPAIR,
    QUALITY_CHECK,
    READY_FOR_PICKUP,
    COMPLETED,
    CANCELLED
}