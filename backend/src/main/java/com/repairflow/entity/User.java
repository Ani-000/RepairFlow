
package com.repairflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false, unique = true)
    public String email;

    @Column(nullable = false)
    public String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Role role = Role.CUSTOMER;

    public LocalDateTime createdAt = LocalDateTime.now();
}
