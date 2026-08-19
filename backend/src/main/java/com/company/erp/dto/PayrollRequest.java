package com.company.erp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PayrollRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Month is required")
    private String month;

    @NotNull(message = "Year is required")
    private Integer year;

    @DecimalMin(value = "0.0", message = "Basic salary cannot be negative")
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "HRA cannot be negative")
    private BigDecimal hra = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Allowances cannot be negative")
    private BigDecimal allowances = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Bonus cannot be negative")
    private BigDecimal bonus = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Overtime cannot be negative")
    private BigDecimal overtime = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Tax deduction cannot be negative")
    private BigDecimal taxDeduction = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Other deductions cannot be negative")
    private BigDecimal otherDeductions = BigDecimal.ZERO;
}
