package com.repairflow.repository;

import com.repairflow.entity.User;
import com.repairflow.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByRole(Role role);
    List<User> findAllByOrderByCreatedAtDesc();
    long countByRole(Role role);
}
