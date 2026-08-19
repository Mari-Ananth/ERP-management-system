package com.company.erp.dto;

import com.company.erp.entity.LeaveRequest;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class LeaveRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String departmentName;
    private Long leaveTypeId;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfDays;
    private String reason;
    private String status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private Boolean informHr;
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public static LeaveRequestResponse fromEntity(LeaveRequest lr) {
        LeaveRequestResponse resp = new LeaveRequestResponse();
        resp.setId(lr.getId());
        resp.setStartDate(lr.getStartDate());
        resp.setEndDate(lr.getEndDate());
        resp.setNumberOfDays(lr.getNumberOfDays());
        resp.setReason(lr.getReason());
        resp.setStatus(lr.getStatus());
        resp.setInformHr(lr.getInformHr());
        resp.setApprovedAt(lr.getApprovedAt());

        resp.setRejectionReason(lr.getRejectionReason());
        resp.setCreatedAt(lr.getCreatedAt());
        resp.setUpdatedAt(lr.getUpdatedAt());

        if (lr.getEmployee() != null) {
            resp.setEmployeeId(lr.getEmployee().getId());
            resp.setEmployeeName(lr.getEmployee().getFirstName() + " " + lr.getEmployee().getLastName());
            if (lr.getEmployee().getDepartment() != null) {
                resp.setDepartmentName(lr.getEmployee().getDepartment().getName());
            }
        }

        if (lr.getLeaveType() != null) {
            resp.setLeaveTypeId(lr.getLeaveType().getId());
            resp.setLeaveTypeName(lr.getLeaveType().getName());
        }

        if (lr.getApprovedBy() != null) {
            resp.setApprovedById(lr.getApprovedBy().getId());
            resp.setApprovedByName(lr.getApprovedBy().getFirstName() + " " + lr.getApprovedBy().getLastName());
        }

        return resp;
    }
}
