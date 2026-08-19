package com.company.erp.controller;

import com.company.erp.dto.*;
import com.company.erp.entity.Employee;
import com.company.erp.entity.Role;
import com.company.erp.entity.User;
import com.company.erp.service.EmployeeService;
import com.company.erp.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private EmployeeService employeeService;
    
    @PostMapping("/leave-types")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveTypeResponse> createLeaveType(@Valid @RequestBody LeaveTypeRequest request) {
        LeaveTypeResponse response = leaveService.createLeaveType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/leave-types/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<LeaveTypeResponse> updateLeaveType(
            @PathVariable Long id,
            @Valid @RequestBody LeaveTypeRequest request
    ) {
        LeaveTypeResponse response = leaveService.updateLeaveType(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leave-types")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<List<LeaveTypeResponse>> getAllLeaveTypes(@RequestParam(required = false) String status) {
        List<LeaveTypeResponse> response = leaveService.getAllLeaveTypes(status);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/leaves/balances/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<List<LeaveBalanceResponse>> getMyBalances(
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        List<LeaveBalanceResponse> balances = leaveService.getBalancesForEmployee(currentUser.getEmployee().getId(), year);
        return ResponseEntity.ok(balances);
    }

    @GetMapping("/leaves/balances/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<List<LeaveBalanceResponse>> getEmployeeBalances(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        
        if (currentUser.getRole() == Role.MANAGER) {
            EmployeeResponse emp = employeeService.getEmployeeById(employeeId);
            boolean isSelf = currentUser.getEmployee() != null && currentUser.getEmployee().getId().equals(employeeId);
            boolean isTeamMember = emp.getManagerId() != null && currentUser.getEmployee() != null && emp.getManagerId().equals(currentUser.getEmployee().getId());
            if (!isSelf && !isTeamMember) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        List<LeaveBalanceResponse> balances = leaveService.getBalancesForEmployee(employeeId, year);
        return ResponseEntity.ok(balances);
    }


    @PostMapping("/leaves")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<LeaveRequestResponse> applyLeave(
            @Valid @RequestBody LeaveRequestDto requestDto,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        LeaveRequestResponse response = leaveService.applyLeave(currentUser.getEmployee().getId(), requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/leaves/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<List<LeaveRequestResponse>> getMyLeaveHistory(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        List<LeaveRequestResponse> history = leaveService.getEmployeeRequests(currentUser.getEmployee().getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/leaves/team")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<List<LeaveRequestResponse>> getTeamLeaveRequests(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        List<LeaveRequestResponse> requests = leaveService.getTeamRequests(currentUser.getEmployee().getId());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/leaves")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<LeaveRequestResponse>> getAllLeaveRequests(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long leaveTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<LeaveRequestResponse> requests = leaveService.getRequestsWithFilters(employeeId, departmentId, leaveTypeId, status, startDate, endDate);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/leaves/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<LeaveRequestResponse> approveLeave(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Security check: Managers can only approve requests of their own team members
        if (currentUser.getRole() == Role.MANAGER) {
            List<LeaveRequestResponse> teamRequests = leaveService.getTeamRequests(currentUser.getEmployee().getId());
            boolean isTeamRequest = teamRequests.stream().anyMatch(r -> r.getId().equals(id));
            if (!isTeamRequest) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        LeaveRequestResponse response = leaveService.approveLeave(id, currentUser.getEmployee().getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/leaves/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<LeaveRequestResponse> rejectLeave(
            @PathVariable Long id,
            @RequestParam String reason,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (currentUser.getRole() == Role.MANAGER) {
            List<LeaveRequestResponse> teamRequests = leaveService.getTeamRequests(currentUser.getEmployee().getId());
            boolean isTeamRequest = teamRequests.stream().anyMatch(r -> r.getId().equals(id));
            if (!isTeamRequest) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        LeaveRequestResponse response = leaveService.rejectLeave(id, currentUser.getEmployee().getId(), reason);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/leaves/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<LeaveRequestResponse> cancelLeave(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        LeaveRequestResponse response = leaveService.cancelLeave(id, currentUser.getEmployee().getId());
        return ResponseEntity.ok(response);
    }
}
