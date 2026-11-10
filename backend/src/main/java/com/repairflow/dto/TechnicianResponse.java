package com.repairflow.dto;

import com.repairflow.entity.User;

public record TechnicianResponse(
        Long id,
        String name,
        String email
) {
    public static TechnicianResponse from(User user) {
        return new TechnicianResponse(
                user.id,
                user.name,
                user.email
        );
    }
}
