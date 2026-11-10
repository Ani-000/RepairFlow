
package com.repairflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_history")
public class RepairHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false)
    public Repair repair;

    @ManyToOne(optional = false)
    public User updatedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public RepairStatus status;

    @Column(columnDefinition = "TEXT")
    public String remarks;

    public LocalDateTime createdAt = LocalDateTime.now();
}
