package com.company.erp.dto;

import com.company.erp.entity.LeaveBalance;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveBalanceResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long leaveTypeId;
    private String leaveTypeName;
    private Integer totalLeaves;
    private Integer usedLeaves;
    private Integer remainingLeaves;
    private Integer year;

    public static LeaveBalanceResponse fromEntity(LeaveBalance balance) {
        LeaveBalanceResponse resp = new LeaveBalanceResponse();
        resp.setId(balance.getId());
        resp.setYear(balance.getYear());
        resp.setTotalLeaves(balance.getTotalLeaves());
        resp.setUsedLeaves(balance.getUsedLeaves());
        resp.setRemainingLeaves(balance.getRemainingLeaves());
        
        if (balance.getEmployee() != null) {
            resp.setEmployeeId(balance.getEmployee().getId());
            resp.setEmployeeName(balance.getEmployee().getFirstName() + " " + balance.getEmployee().getLastName());
        }
        
        if (balance.getLeaveType() != null) {
            resp.setLeaveTypeId(balance.getLeaveType().getId());
            resp.setLeaveTypeName(balance.getLeaveType().getName());
        }
        
        return resp;
    }
}
