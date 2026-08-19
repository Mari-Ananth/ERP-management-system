package com.company.erp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    private String phone;

    private LocalDate dateOfBirth;

    private String gender;

    private String address;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    @NotBlank(message = "Designation is required")
    private String designation;

    private String employmentType = "FULL_TIME"; // FULL_TIME, PART_TIME, CONTRACT, INTERN

    private String employmentStatus = "ACTIVE"; // ACTIVE, INACTIVE, ON_NOTICE, TERMINATED

    private Long departmentId;

    private Long managerId;

    // Login credentials info
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password; // optional on update, mandatory on create

    @NotBlank(message = "User role is required")
    private String role; // ADMIN, HR, MANAGER, FINANCE, EMPLOYEE
}
