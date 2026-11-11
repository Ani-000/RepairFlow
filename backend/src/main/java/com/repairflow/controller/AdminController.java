package com.repairflow.controller;

import com.repairflow.dto.*;
import com.repairflow.entity.*;
import com.repairflow.repository.*;
import com.repairflow.service.CurrentUserService;
import com.repairflow.service.RepairService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final RepairService repairService;
    private final RepairRepository repairRepository;
    private final UserRepository userRepository;
    private final RepairHistoryRepository historyRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(RepairService repairService, RepairRepository repairRepository,
            UserRepository userRepository, RepairHistoryRepository historyRepository,
            CurrentUserService currentUserService, PasswordEncoder passwordEncoder) {
        this.repairService = repairService;
        this.repairRepository = repairRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<TechnicianResponse>> getTechnicians() {
        return ResponseEntity.ok(userRepository.findAllByRole(Role.TECHNICIAN)
                .stream().map(TechnicianResponse::from).toList());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers() {
        return ResponseEntity.ok(userRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(AdminUserResponse::from).toList());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        if (request.role() != Role.TECHNICIAN && request.role() != Role.LEAD_TECH) {
            return ResponseEntity.badRequest().body(Map.of("error", "Admin can create only lead technician and technician profiles"));
        }
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        User user = new User();
        user.name = request.name().trim();
        user.email = email;
        user.password = passwordEncoder.encode(request.password());
        user.role = request.role();
        return ResponseEntity.status(HttpStatus.CREATED).body(AdminUserResponse.from(userRepository.save(user)));
    }

    
@PutMapping("/users/{id}/role")
public ResponseEntity<?> updateRole(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {

    User actor = currentUserService.getCurrentUser();

    // Only administrators can change staff roles.
    if (actor.role != Role.ADMIN) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Administrator access required"));
    }

    User target = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

    // Administrator accounts cannot have their roles changed.
    if (target.role == Role.ADMIN) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Administrator roles cannot be changed"));
    }

    Role newRole;

    try {
        newRole = Role.valueOf(
                body.getOrDefault("role", "").trim().toUpperCase()
        );
    } catch (Exception ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid role"));
    }

    // Only employee accounts can participate in role changes.
    if (target.role != Role.TECHNICIAN
            && target.role != Role.LEAD_TECH) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Customer roles cannot be changed"));
    }

    // Employees can only switch between the two employee roles.
    if (newRole != Role.TECHNICIAN
            && newRole != Role.LEAD_TECH) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Employees can only be assigned Technician or Lead Technician roles"));
    }

    target.role = newRole;

    return ResponseEntity.ok(
            AdminUserResponse.from(userRepository.save(target))
    );
}


    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User actor = currentUserService.getCurrentUser();
        User target = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (target.role == Role.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("error", "The predefined ADMIN account cannot be deleted"));
        }
        if (target.id.equals(actor.id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot delete your own account"));
        }
        List<Repair> customerRepairs = repairRepository.findByCustomerId(id);
        List<Repair> technicianRepairs = repairRepository.findByTechnicianId(id);
        java.util.Set<Long> repairIds = new java.util.HashSet<>();
        customerRepairs.forEach(r -> repairIds.add(r.id));
        technicianRepairs.forEach(r -> repairIds.add(r.id));
        for (Long repairId : repairIds) {
            historyRepository.deleteByRepairId(repairId);
            repairRepository.deleteById(repairId);
        }
        historyRepository.deleteByUpdatedById(id);
        userRepository.delete(target);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    @DeleteMapping("/repairs/{id}")
    public ResponseEntity<?> deleteRepair(@PathVariable Long id) {
        Repair repair = repairRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Repair not found"));
        historyRepository.deleteByRepairId(id);
        repairRepository.delete(repair);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/repairs/{id}/technician")
    public ResponseEntity<RepairResponse> assignTechnician(@PathVariable Long id,
            @RequestBody AssignTechnicianRequest request) {
        User actor = currentUserService.getCurrentUser();
        if (actor.role != Role.ADMIN && actor.role != Role.LEAD_TECH) {
            throw new IllegalArgumentException("Admin or lead technician access required");
        }
        repairService.assignTechnician(id, request.technicianId(), actor.id);
        Repair repair = repairRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Repair not found"));
        return ResponseEntity.ok(RepairResponse.from(repair));
    }
}
