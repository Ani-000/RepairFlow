
package com.repairflow.controller;

import com.repairflow.dto.*;
import com.repairflow.entity.*;
import com.repairflow.repository.*;
import com.repairflow.service.CurrentUserService;
import com.repairflow.service.RepairService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

    private final RepairService repairService;
    private final RepairRepository repairRepository;
    private final RepairHistoryRepository historyRepository;
    private final CurrentUserService currentUserService;

    public RepairController(
            RepairService repairService,
            RepairRepository repairRepository,
            RepairHistoryRepository historyRepository,
            CurrentUserService currentUserService) {

        this.repairService = repairService;
        this.repairRepository = repairRepository;
        this.historyRepository = historyRepository;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<RepairResponse> createRepair(
            @RequestBody RepairRequest request) {

        User customer = currentUserService.getCurrentUser();

        Repair repair = new Repair();
        repair.deviceType = request.deviceType();
        repair.deviceName = request.deviceName();
        repair.problemDescription = request.problemDescription();

        Repair saved = repairService.createRepair(customer.id, repair);

        return ResponseEntity.ok(RepairResponse.from(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairResponse> getRepair(
            @PathVariable Long id) {

        User user = currentUserService.getCurrentUser();

        Repair repair = repairRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Repair not found"));

        if (user.role == Role.CUSTOMER &&
                !repair.customer.id.equals(user.id)) {
            throw new IllegalArgumentException("Access denied");
        }

        if (user.role == Role.TECHNICIAN &&
                (repair.technician == null ||
                 !repair.technician.id.equals(user.id))) {
            throw new IllegalArgumentException("Access denied");
        }

        return ResponseEntity.ok(RepairResponse.from(repair));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RepairResponse>> getMyRepairs() {

        User user = currentUserService.getCurrentUser();

        List<Repair> repairs;

        if (user.role == Role.CUSTOMER) {
            repairs = repairRepository.findByCustomerId(user.id);
        } else if (user.role == Role.TECHNICIAN) {
            repairs = repairRepository.findByTechnicianId(user.id);
        } else {
            repairs = repairRepository.findAll();
        }

        return ResponseEntity.ok(
                repairs.stream()
                        .map(RepairResponse::from)
                        .toList()
        );
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<HistoryResponse>> getRepairHistory(
            @PathVariable Long id) {

        User user = currentUserService.getCurrentUser();

        Repair repair = repairRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Repair not found"));

        if (user.role == Role.CUSTOMER &&
                !repair.customer.id.equals(user.id)) {
            throw new IllegalArgumentException("Access denied");
        }

        if (user.role == Role.TECHNICIAN &&
                (repair.technician == null ||
                 !repair.technician.id.equals(user.id))) {
            throw new IllegalArgumentException("Access denied");
        }

        return ResponseEntity.ok(
                historyRepository
                        .findByRepairIdOrderByCreatedAtDesc(id)
                        .stream()
                        .map(HistoryResponse::from)
                        .toList()
        );
    }

    @PostMapping("/{id}/estimate")
    public ResponseEntity<RepairResponse> submitEstimate(
            @PathVariable Long id,
            @RequestBody EstimateRequest request) {

        User technician = currentUserService.getCurrentUser();

        if (technician.role != Role.TECHNICIAN && technician.role != Role.LEAD_TECH
                && technician.role != Role.ADMIN) {
            throw new IllegalArgumentException("Technician access required");
        }

        Repair repair = repairService.submitEstimate(
                id, technician.id, request.estimatedCost());

        return ResponseEntity.ok(RepairResponse.from(repair));
    }

    @PostMapping("/{id}/approval")
    public ResponseEntity<RepairResponse> approveEstimate(
            @PathVariable Long id,
            @RequestBody ApprovalRequest request) {

        User customer = currentUserService.getCurrentUser();

        if (customer.role != Role.CUSTOMER && customer.role != Role.ADMIN) {
            throw new IllegalArgumentException("Customer access required");
        }

        Repair repair = repairService.approveEstimate(
                id, customer.id, request.approved());

        return ResponseEntity.ok(RepairResponse.from(repair));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<RepairResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {

        User user = currentUserService.getCurrentUser();

        if (user.role != Role.TECHNICIAN &&
                user.role != Role.LEAD_TECH && user.role != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied");
        }

        Repair repair = repairService.updateStatus(
                id, user.id, request.status(), request.remarks());

        return ResponseEntity.ok(RepairResponse.from(repair));
    }
}
