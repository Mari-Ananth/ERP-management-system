package com.company.erp.controller;

import com.company.erp.dto.PayrollRequest;
import com.company.erp.dto.PayrollResponse;
import com.company.erp.entity.Role;
import com.company.erp.entity.User;
import com.company.erp.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public ResponseEntity<PayrollResponse> createPayroll(@Valid @RequestBody PayrollRequest request) {
        PayrollResponse response = payrollService.createPayroll(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public ResponseEntity<List<PayrollResponse>> generateMonthlyPayroll(
            @RequestParam String month,
            @RequestParam Integer year
    ) {
        List<PayrollResponse> response = payrollService.generateMonthlyPayroll(month, year);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public ResponseEntity<PayrollResponse> updatePayroll(
            @PathVariable Long id,
            @Valid @RequestBody PayrollRequest request
    ) {
        PayrollResponse response = payrollService.updatePayroll(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public ResponseEntity<PayrollResponse> markAsPaid(@PathVariable Long id) {
        PayrollResponse response = payrollService.markAsPaid(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<PayrollResponse> getPayrollById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        PayrollResponse response = payrollService.getPayrollById(id);

        // Security check: regular employees can ONLY view their own payroll
        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (currentUser.getEmployee() == null || !currentUser.getEmployee().getId().equals(response.getEmployeeId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public ResponseEntity<List<PayrollResponse>> getAllPayrolls(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status
    ) {
        List<PayrollResponse> response = payrollService.getPayrollsWithFilters(employeeId, departmentId, month, year, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<List<PayrollResponse>> getMyPayrollHistory(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        List<PayrollResponse> history = payrollService.getEmployeePayrollHistory(currentUser.getEmployee().getId());
        return ResponseEntity.ok(history);
    }
}
