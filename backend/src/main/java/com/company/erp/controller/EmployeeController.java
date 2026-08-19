package com.company.erp.controller;

import com.company.erp.dto.EmployeeRequest;
import com.company.erp.dto.EmployeeResponse;
import com.company.erp.entity.Role;
import com.company.erp.entity.User;
import com.company.erp.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE')")
    public ResponseEntity<Page<EmployeeResponse>> getEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        Long managerId = null;

        // If the user is a MANAGER (and not admin/hr/finance), limit them to their team members
        if (currentUser.getRole() == Role.MANAGER) {
            if (currentUser.getEmployee() != null) {
                managerId = currentUser.getEmployee().getId();
            } else {
                // Manager user has no associated employee profile
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<EmployeeResponse> response = employeeService.getAllEmployees(search, departmentId, managerId, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        EmployeeResponse response = employeeService.getEmployeeById(id);

        // Security check: regular employees can only see themselves
        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (currentUser.getEmployee() == null || !currentUser.getEmployee().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        // Security check: managers can only see themselves or their direct team members
        if (currentUser.getRole() == Role.MANAGER) {
            boolean isSelf = currentUser.getEmployee() != null && currentUser.getEmployee().getId().equals(id);
            boolean isTeamMember = response.getManagerId() != null && currentUser.getEmployee() != null && response.getManagerId().equals(currentUser.getEmployee().getId());
            
            if (!isSelf && !isTeamMember) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE', 'MANAGER', 'FINANCE')")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        boolean isSelf = currentUser.getEmployee() != null && currentUser.getEmployee().getId().equals(id);

        // ADMIN and HR can edit everything
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.HR) {
            EmployeeResponse response = employeeService.updateEmployee(id, request);
            return ResponseEntity.ok(response);
        }

        // Employees/Managers/Finance can only edit their own contact details (phone, address)
        if (isSelf) {
            EmployeeResponse response = employeeService.updateProfile(id, request);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<EmployeeResponse> deactivateEmployee(@PathVariable Long id) {
        EmployeeResponse response = employeeService.deactivateEmployee(id);
        return ResponseEntity.ok(response);
    }
}
