
package com.repairflow.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "repairs")
public class Repair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, unique = true)
    public String ticketId;

    @ManyToOne(optional = false)
    public User customer;

    @ManyToOne
    public User technician;

    @Column(nullable = false)
    public String deviceType;

    @Column(nullable = false)
    public String deviceName;

    @Column(nullable = false, columnDefinition = "TEXT")
    public String problemDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public RepairStatus status = RepairStatus.RECEIVED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ApprovalStatus approvalStatus = ApprovalStatus.NOT_REQUIRED;

    public BigDecimal estimatedCost;

    public LocalDateTime createdAt = LocalDateTime.now();

    public LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }
}
