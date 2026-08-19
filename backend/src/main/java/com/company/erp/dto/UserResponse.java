package com.company.erp.dto;

import com.company.erp.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String email;
    private String role;
    private boolean enabled;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;

    public static UserResponse fromEntity(User user) {
        UserResponse resp = new UserResponse();
        resp.setId(user.getId());
        resp.setEmail(user.getEmail());
        resp.setRole(user.getRole().name());
        resp.setEnabled(user.isEnabled());

        if (user.getEmployee() != null) {
            resp.setEmployeeId(user.getEmployee().getId());
            resp.setEmployeeCode(user.getEmployee().getEmployeeCode());
            resp.setEmployeeName(user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName());
        }

        return resp;
    }
}
