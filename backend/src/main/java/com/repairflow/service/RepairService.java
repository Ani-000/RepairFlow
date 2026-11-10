package com.repairflow.service;

import com.repairflow.entity.*;
import com.repairflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RepairService {

    private final RepairRepository repairRepository;
    private final UserRepository userRepository;
    private final RepairHistoryRepository historyRepository;

    public RepairService(
            RepairRepository repairRepository,
            UserRepository userRepository,
            RepairHistoryRepository historyRepository) {
        this.repairRepository = repairRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional
    public Repair createRepair(Long customerId, Repair repair) {

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        repair.customer = customer;
        repair.ticketId = "RF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        repair.status = RepairStatus.RECEIVED;
        repair.approvalStatus = ApprovalStatus.NOT_REQUIRED;

        Repair savedRepair = repairRepository.save(repair);

        RepairHistory history = new RepairHistory();
        history.repair = savedRepair;
        history.updatedBy = customer;
        history.status = RepairStatus.RECEIVED;
        history.remarks = "Repair request created";

        historyRepository.save(history);

        return savedRepair;
    }


@Transactional
public Repair updateStatus(
        Long repairId,
        Long userId,
        RepairStatus newStatus,
        String remarks) {

    Repair repair = repairRepository.findById(repairId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Repair not found"));

    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new IllegalArgumentException("User not found"));

    if (user.role == Role.TECHNICIAN) {
        if (repair.technician == null ||
                !repair.technician.id.equals(user.id)) {
            throw new IllegalArgumentException(
                    "Repair is not assigned to this technician");
        }
    } else if (user.role != Role.ADMIN && user.role != Role.LEAD_TECH) {
        throw new IllegalArgumentException("Access denied");
    }

    boolean validTransition = switch (repair.status) {
        case RECEIVED -> newStatus == RepairStatus.DIAGNOSING;
        case IN_REPAIR -> newStatus == RepairStatus.READY_FOR_PICKUP;
        case READY_FOR_PICKUP -> newStatus == RepairStatus.COMPLETED;
        default -> false;
    };

    if (!validTransition) {
        throw new IllegalArgumentException(
                "Invalid status transition: " +
                repair.status + " -> " + newStatus);
    }

    repair.status = newStatus;
    Repair saved = repairRepository.save(repair);

    RepairHistory history = new RepairHistory();
    history.repair = saved;
    history.updatedBy = user;
    history.status = newStatus;
    history.remarks = remarks;

    historyRepository.save(history);

    return saved;
}

    @Transactional
    public Repair assignTechnician(Long repairId, Long technicianId, Long assignedById) {
        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new IllegalArgumentException("Repair not found"));
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));
        User actor = userRepository.findById(assignedById)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (technician.role != Role.TECHNICIAN) {
            throw new IllegalArgumentException("User is not a technician");
        }
        repair.technician = technician;
        Repair saved = repairRepository.save(repair);
        RepairHistory history = new RepairHistory();
        history.repair = saved;
        history.updatedBy = actor;
        history.status = saved.status;
        history.remarks = "Assigned to technician " + technician.name;
        historyRepository.save(history);
        return saved;
    }

    @Transactional
    public Repair submitEstimate(Long repairId, Long technicianId,
                                 java.math.BigDecimal estimatedCost) {

        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new IllegalArgumentException("Repair not found"));

        if (repair.status != RepairStatus.DIAGNOSING) {
           throw new IllegalArgumentException(
            "Repair must be in DIAGNOSING status before submitting an estimate");
}

        User submittingUser = userRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (submittingUser.role != Role.ADMIN && submittingUser.role != Role.LEAD_TECH &&
                (repair.technician == null || !repair.technician.id.equals(technicianId))) {
            throw new IllegalArgumentException("Unauthorized technician");
        }

        if (estimatedCost == null || estimatedCost.signum() <= 0) {
            throw new IllegalArgumentException("Invalid estimated cost");
        }

        repair.estimatedCost = estimatedCost;
        repair.approvalStatus = ApprovalStatus.PENDING;
        repair.status = RepairStatus.AWAITING_APPROVAL;

        Repair savedRepair = repairRepository.save(repair);

        RepairHistory history = new RepairHistory();
        history.repair = savedRepair;
        history.updatedBy = submittingUser;
        history.status = RepairStatus.AWAITING_APPROVAL;
        history.remarks = "Repair estimate submitted";

        historyRepository.save(history);

        return savedRepair;
    }

    @Transactional
public Repair approveEstimate(Long repairId, Long customerId, boolean approved) {

    Repair repair = repairRepository.findById(repairId)
            .orElseThrow(() -> new IllegalArgumentException("Repair not found"));

    User approvingUser = userRepository.findById(customerId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    if (approvingUser.role != Role.ADMIN && !repair.customer.id.equals(customerId)) {
        throw new IllegalArgumentException("Unauthorized customer");
    }

    if (repair.approvalStatus != ApprovalStatus.PENDING) {
        throw new IllegalArgumentException("No pending estimate");
    }

    repair.approvalStatus = approved
            ? ApprovalStatus.APPROVED
            : ApprovalStatus.REJECTED;

    repair.status = approved
            ? RepairStatus.IN_REPAIR
            : RepairStatus.CANCELLED;

    Repair savedRepair = repairRepository.save(repair);

    RepairHistory history = new RepairHistory();
    history.repair = savedRepair;
    history.updatedBy = approvingUser;
    history.status = savedRepair.status;
    history.remarks = approved
            ? "Customer approved the estimate"
            : "Customer rejected the estimate";

    historyRepository.save(history);

    return savedRepair;
}
}