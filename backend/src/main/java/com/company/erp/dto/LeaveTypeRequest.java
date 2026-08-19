package com.company.erp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveTypeRequest {

    @NotBlank(message = "Leave type name is required")
    private String name;

    private String description;

    @NotNull(message = "Annual limit is required")
    @Min(value = 0, message = "Annual limit cannot be negative")
    private Integer annualLimit;

    @NotNull(message = "Paid status is required")
    private Boolean paid = true;

    private String status = "ACTIVE"; // ACTIVE, INACTIVE
}
