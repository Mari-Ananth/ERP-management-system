package com.company.erp.dto;

import com.company.erp.entity.Department;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DepartmentResponse {
    private Long id;
    private String departmentCode;
    private String name;
    private String description;
    private Long managerId;
    private String managerName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer employeeCount;

    public static DepartmentResponse fromEntity(Department dept) {
        DepartmentResponse resp = new DepartmentResponse();
        resp.setId(dept.getId());
        resp.setDepartmentCode(dept.getDepartmentCode());
        resp.setName(dept.getName());
        resp.setDescription(dept.getDescription());
        resp.setStatus(dept.getStatus());
        resp.setCreatedAt(dept.getCreatedAt());
        resp.setUpdatedAt(dept.getUpdatedAt());

        if (dept.getManager() != null) {
            resp.setManagerId(dept.getManager().getId());
            resp.setManagerName(dept.getManager().getFirstName() + " " + dept.getManager().getLastName());
        }

        if (dept.getEmployees() != null) {
            resp.setEmployeeCount(dept.getEmployees().size());
        } else {
            resp.setEmployeeCount(0);
        }

        return resp;
    }
}
