package com.repairflow.service;

import com.repairflow.entity.User;
import com.repairflow.entity.Role;
import com.repairflow.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String name, String email, String password) {

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.name = name;
        user.email = email;
        user.password = passwordEncoder.encode(password);
        user.role = Role.CUSTOMER;

        return userRepository.save(user);
    }
}