package com.company.erp.controller;

import com.company.erp.dto.HRDashboardResponse;
import com.company.erp.entity.LeaveRequest;
import com.company.erp.repository.DepartmentRepository;
import com.company.erp.repository.EmployeeRepository;
import com.company.erp.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class HRController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<HRDashboardResponse> getDashboardStats() {
        HRDashboardResponse stats = new HRDashboardResponse();

        long total = employeeRepository.count();
        long active = employeeRepository.findAll().stream()
                .filter(e -> "ACTIVE".equalsIgnoreCase(e.getEmploymentStatus()))
                .count();
        long inactive = total - active;

        long departments = departmentRepository.count();

        List<LeaveRequest> leaveRequests = leaveRequestRepository.findAll();
        long pending = leaveRequests.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus())).count();
        long approved = leaveRequests.stream().filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus())).count();
        long rejected = leaveRequests.stream().filter(r -> "REJECTED".equalsIgnoreCase(r.getStatus())).count();

        LocalDate today = LocalDate.now();
        long onLeave = leaveRequests.stream()
                .filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus()))
                .filter(r -> !today.isBefore(r.getStartDate()) && !today.isAfter(r.getEndDate()))
                .count();

        stats.setTotalEmployees(total);
        stats.setActiveEmployees(active);
        stats.setInactiveEmployees(inactive);
        stats.setTotalDepartments(departments);
        stats.setPendingLeaveRequests(pending);
        stats.setApprovedLeaves(approved);
        stats.setRejectedLeaves(rejected);
        stats.setEmployeesOnLeave(onLeave);

        return ResponseEntity.ok(stats);
    }
}
