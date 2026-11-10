package com.repairflow.dto;

import com.repairflow.entity.User;
import com.repairflow.entity.Role;

public record AdminUserResponse(Long id, String name, String email, Role role) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(user.id, user.name, user.email, user.role);
    }
}
