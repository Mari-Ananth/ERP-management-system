package com.company.erp.dto;

import com.company.erp.entity.LeaveType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveTypeResponse {
    private Long id;
    private String name;
    private String description;
    private Integer annualLimit;
    private Boolean paid;
    private String status;

    public static LeaveTypeResponse fromEntity(LeaveType type) {
        LeaveTypeResponse resp = new LeaveTypeResponse();
        resp.setId(type.getId());
        resp.setName(type.getName());
        resp.setDescription(type.getDescription());
        resp.setAnnualLimit(type.getAnnualLimit());
        resp.setPaid(type.getPaid());
        resp.setStatus(type.getStatus());
        return resp;
    }
}
