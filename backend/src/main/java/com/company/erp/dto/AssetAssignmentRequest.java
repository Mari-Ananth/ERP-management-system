package com.company.erp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssetAssignmentRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String notes;
}
