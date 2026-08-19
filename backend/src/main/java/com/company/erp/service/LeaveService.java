package com.company.erp.service;

import com.company.erp.dto.*;
import com.company.erp.entity.*;
import com.company.erp.exception.ResourceNotFoundException;
import com.company.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper: Calculate working days (exclude weekends)
    public int calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        int workingDays = 0;
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (current.getDayOfWeek().getValue() < 6) { // Monday-Friday are 1-5
                workingDays++;
            }
            current = current.plusDays(1);
        }
        return workingDays;
    }

    @Transactional
    public LeaveTypeResponse createLeaveType(LeaveTypeRequest request) {
        if (leaveTypeRepository.existsByName(request.getName().toUpperCase())) {
            throw new IllegalArgumentException("Leave type with name " + request.getName() + " already exists.");
        }
        LeaveType type = new LeaveType();
        type.setName(request.getName().toUpperCase());
        type.setDescription(request.getDescription());
        type.setAnnualLimit(request.getAnnualLimit());
        type.setPaid(request.getPaid());
        type.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        LeaveType saved = leaveTypeRepository.save(type);
        return LeaveTypeResponse.fromEntity(saved);
    }

    @Transactional
    public LeaveTypeResponse updateLeaveType(Long id, LeaveTypeRequest request) {
        LeaveType type = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found with ID: " + id));

        if (leaveTypeRepository.existsByNameAndIdNot(request.getName().toUpperCase(), id)) {
            throw new IllegalArgumentException("Leave type with name " + request.getName() + " already exists.");
        }

        type.setName(request.getName().toUpperCase());
        type.setDescription(request.getDescription());
        type.setAnnualLimit(request.getAnnualLimit());
        type.setPaid(request.getPaid());
        if (request.getStatus() != null) {
            type.setStatus(request.getStatus());
        }

        LeaveType saved = leaveTypeRepository.save(type);
        return LeaveTypeResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveTypeResponse> getAllLeaveTypes(String status) {
        List<LeaveType> types = (status != null) ? leaveTypeRepository.findByStatus(status) : leaveTypeRepository.findAll();
        return types.stream().map(LeaveTypeResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public List<LeaveBalanceResponse> getBalancesForEmployee(Long employeeId, Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        
       
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        List<LeaveType> activeTypes = leaveTypeRepository.findByStatus("ACTIVE");
        for (LeaveType type : activeTypes) {
            if (!leaveBalanceRepository.existsByEmployeeIdAndLeaveTypeIdAndYear(employeeId, type.getId(), targetYear)) {
                LeaveBalance newBal = new LeaveBalance();
                newBal.setEmployee(emp);
                newBal.setLeaveType(type);
                newBal.setTotalLeaves(type.getAnnualLimit());
                newBal.setUsedLeaves(0);
                newBal.setRemainingLeaves(type.getAnnualLimit());
                newBal.setYear(targetYear);
                leaveBalanceRepository.save(newBal);
            }
        }

        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, targetYear).stream()
                .map(LeaveBalanceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestResponse applyLeave(Long employeeId, LeaveRequestDto requestDto) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        LeaveType type = leaveTypeRepository.findById(requestDto.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found with ID: " + requestDto.getLeaveTypeId()));

        if (!"ACTIVE".equals(type.getStatus())) {
            throw new IllegalArgumentException("This leave type is currently inactive.");
        }

        if (requestDto.getStartDate().isAfter(requestDto.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        int workingDays = calculateWorkingDays(requestDto.getStartDate(), requestDto.getEndDate());
        if (workingDays <= 0) {
            throw new IllegalArgumentException("Selected period does not contain any working days (e.g. only weekends).");
        }

        if (leaveRequestRepository.existsOverlappingRequest(employeeId, requestDto.getStartDate(), requestDto.getEndDate())) {
            throw new IllegalArgumentException("An overlapping leave request (PENDING or APPROVED) already exists for this date range.");
        }

        int year = requestDto.getStartDate().getYear();

        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, type.getId(), year)
                .orElseGet(() -> {
                    LeaveBalance newBal = new LeaveBalance();
                    newBal.setEmployee(emp);
                    newBal.setLeaveType(type);
                    newBal.setTotalLeaves(type.getAnnualLimit());
                    newBal.setUsedLeaves(0);
                    newBal.setRemainingLeaves(type.getAnnualLimit());
                    newBal.setYear(year);
                    return leaveBalanceRepository.save(newBal);
                });

        if (balance.getRemainingLeaves() < workingDays) {
            throw new IllegalArgumentException("Insufficient leave balance. Remaining: " + balance.getRemainingLeaves() + " days, Requested: " + workingDays + " days.");
        }

        LeaveRequest lr = new LeaveRequest();
        lr.setEmployee(emp);
        lr.setLeaveType(type);
        lr.setStartDate(requestDto.getStartDate());
        lr.setEndDate(requestDto.getEndDate());
        lr.setNumberOfDays(workingDays);
        lr.setReason(requestDto.getReason());
        lr.setStatus("PENDING");
        lr.setInformHr(requestDto.getInformHr() != null ? requestDto.getInformHr() : false);

        LeaveRequest saved = leaveRequestRepository.save(lr);
        return LeaveRequestResponse.fromEntity(saved);
    }

    @Transactional
    public LeaveRequestResponse approveLeave(Long requestId, Long approverEmployeeId) {
        LeaveRequest lr = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        if (!"PENDING".equals(lr.getStatus())) {
            throw new IllegalArgumentException("Leave request is already processed. Current status: " + lr.getStatus());
        }

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Approver employee not found with ID: " + approverEmployeeId));

        if (lr.getEmployee().getId().equals(approverEmployeeId)) {
            throw new IllegalArgumentException("You cannot approve your own leave request.");
        }

        int year = lr.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(lr.getEmployee().getId(), lr.getLeaveType().getId(), year)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found."));

        if (balance.getRemainingLeaves() < lr.getNumberOfDays()) {
            throw new IllegalArgumentException("Cannot approve. Employee has insufficient leave balance.");
        }

        balance.setUsedLeaves(balance.getUsedLeaves() + lr.getNumberOfDays());
        balance.setRemainingLeaves(balance.getTotalLeaves() - balance.getUsedLeaves());
        leaveBalanceRepository.save(balance);

        lr.setStatus("APPROVED");
        lr.setApprovedBy(approver);
        lr.setApprovedAt(LocalDateTime.now());

        LeaveRequest saved = leaveRequestRepository.save(lr);
        return LeaveRequestResponse.fromEntity(saved);
    }

    @Transactional
    public LeaveRequestResponse rejectLeave(Long requestId, Long approverEmployeeId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }

        LeaveRequest lr = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        if (!"PENDING".equals(lr.getStatus())) {
            throw new IllegalArgumentException("Leave request is already processed. Current status: " + lr.getStatus());
        }

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Approver employee not found with ID: " + approverEmployeeId));

        if (lr.getEmployee().getId().equals(approverEmployeeId)) {
            throw new IllegalArgumentException("You cannot reject your own leave request.");
        }

        lr.setStatus("REJECTED");
        lr.setApprovedBy(approver);
        lr.setApprovedAt(LocalDateTime.now());
        lr.setRejectionReason(reason);

        LeaveRequest saved = leaveRequestRepository.save(lr);
        return LeaveRequestResponse.fromEntity(saved);
    }

    @Transactional
    public LeaveRequestResponse cancelLeave(Long requestId, Long employeeId) {
        LeaveRequest lr = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        if (!lr.getEmployee().getId().equals(employeeId)) {
            throw new SecurityException("You are not authorized to cancel this leave request.");
        }

        if (!"PENDING".equals(lr.getStatus())) {
            throw new IllegalArgumentException("Only PENDING leave requests can be cancelled. Current status: " + lr.getStatus());
        }

        lr.setStatus("CANCELLED");
        LeaveRequest saved = leaveRequestRepository.save(lr);
        return LeaveRequestResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getRequestsWithFilters(Long employeeId, Long departmentId, Long leaveTypeId, String status, LocalDate start, LocalDate end) {
        return leaveRequestRepository.findRequestsWithFilters(employeeId, departmentId, leaveTypeId, status, start, end).stream()
                .map(LeaveRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getTeamRequests(Long managerId) {
        return leaveRequestRepository.findByEmployeeManagerId(managerId).stream()
                .map(LeaveRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getEmployeeRequests(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(LeaveRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
