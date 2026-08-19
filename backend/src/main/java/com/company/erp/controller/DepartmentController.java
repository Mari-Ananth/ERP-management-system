package com.company.erp.controller;

import com.company.erp.dto.DepartmentRequest;
import com.company.erp.dto.DepartmentResponse;
import com.company.erp.dto.EmployeeResponse;
import com.company.erp.entity.Department;
import com.company.erp.entity.Employee;
import com.company.erp.entity.Role;
import com.company.erp.entity.User;
import com.company.erp.service.DepartmentService;
import com.company.erp.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments(
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        List<DepartmentResponse> departments = departmentService.getAllDepartments(search);
        
        // If regular EMPLOYEE, they can see all department names/details, but we can filter or return all.
        // Usually, seeing list of departments is fine for employees (e.g. for registration, directories).
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<DepartmentResponse> getDepartmentById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        DepartmentResponse response = departmentService.getDepartmentById(id);

        // Security check: regular employees can only see their own department info
        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (currentUser.getEmployee() == null || 
                currentUser.getEmployee().getDepartment() == null || 
                !currentUser.getEmployee().getDepartment().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse response = departmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request
    ) {
        DepartmentResponse response = departmentService.updateDepartment(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<DepartmentResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        DepartmentResponse response = departmentService.changeStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesInDepartment(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();

        // Security check: regular employees can only see employees in their own department
        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (currentUser.getEmployee() == null || 
                currentUser.getEmployee().getDepartment() == null || 
                !currentUser.getEmployee().getDepartment().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        // Security check: managers can only see their own department's employees unless they manage it or belong to it
        if (currentUser.getRole() == Role.MANAGER) {
            DepartmentResponse dept = departmentService.getDepartmentById(id);
            boolean isDeptManager = dept.getManagerId() != null && currentUser.getEmployee() != null && dept.getManagerId().equals(currentUser.getEmployee().getId());
            boolean belongsToDept = currentUser.getEmployee() != null && currentUser.getEmployee().getDepartment() != null && currentUser.getEmployee().getDepartment().getId().equals(id);
            if (!isDeptManager && !belongsToDept) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        // Fetch employees belonging to the department
        List<EmployeeResponse> employees = departmentService.getEmployeesByDepartmentId(id);
        return ResponseEntity.ok(employees);
    }
}
