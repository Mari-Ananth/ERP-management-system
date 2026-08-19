package com.company.erp.controller;

import com.company.erp.dto.UserResponse;
import com.company.erp.entity.Role;
import com.company.erp.entity.User;
import com.company.erp.exception.ResourceNotFoundException;
import com.company.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled
    ) {
        Role enumRole = null;
        if (role != null && !role.isBlank()) {
            try {
                enumRole = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        List<UserResponse> users = userRepository.findUsersWithFilters(search, enumRole, enabled).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getId().equals(id)) {
            throw new IllegalArgumentException("You cannot activate/deactivate your own user account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setEnabled(enabled);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(UserResponse.fromEntity(saved));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getId().equals(id)) {
            throw new IllegalArgumentException("You cannot change your own user role.");
        }

        Role targetRole;
        try {
            targetRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role specified.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setRole(targetRole);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(UserResponse.fromEntity(saved));
    }
}
