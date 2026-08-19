package com.company.erp.dto;

import com.company.erp.entity.Employee;
import com.company.erp.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class EmployeeResponse {
    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDate joiningDate;
    private String designation;
    private String employmentType;
    private String employmentStatus;
    private String profileImage;
    
    private Long departmentId;
    private String departmentName;
    
    private Long managerId;
    private String managerName;
    
    private String role;
    private boolean enabled;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EmployeeResponse fromEntity(Employee emp, User user) {
        EmployeeResponse resp = new EmployeeResponse();
        resp.setId(emp.getId());
        resp.setEmployeeCode(emp.getEmployeeCode());
        resp.setFirstName(emp.getFirstName());
        resp.setLastName(emp.getLastName());
        resp.setEmail(emp.getEmail());
        resp.setPhone(emp.getPhone());
        resp.setDateOfBirth(emp.getDateOfBirth());
        resp.setGender(emp.getGender());
        resp.setAddress(emp.getAddress());
        resp.setJoiningDate(emp.getJoiningDate());
        resp.setDesignation(emp.getDesignation());
        resp.setEmploymentType(emp.getEmploymentType());
        resp.setEmploymentStatus(emp.getEmploymentStatus());
        resp.setProfileImage(emp.getProfileImage());
        resp.setCreatedAt(emp.getCreatedAt());
        resp.setUpdatedAt(emp.getUpdatedAt());

        if (emp.getDepartment() != null) {
            resp.setDepartmentId(emp.getDepartment().getId());
            resp.setDepartmentName(emp.getDepartment().getName());
        }

        if (emp.getManager() != null) {
            resp.setManagerId(emp.getManager().getId());
            resp.setManagerName(emp.getManager().getFirstName() + " " + emp.getManager().getLastName());
        }

        if (user != null) {
            resp.setRole(user.getRole().name());
            resp.setEnabled(user.isEnabled());
        }

        return resp;
    }
}
