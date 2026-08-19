package com.company.erp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HRDashboardResponse {
    private long totalEmployees;
    private long activeEmployees;
    private long inactiveEmployees;
    private long totalDepartments;
    private long pendingLeaveRequests;
    private long approvedLeaves;
    private long rejectedLeaves;
    private long employeesOnLeave;
}
