package com.company.erp.dto;

import com.company.erp.entity.Payroll;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private String designation;
    private String month;
    private Integer year;
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal allowances;
    private BigDecimal bonus;
    private BigDecimal overtime;
    private BigDecimal grossSalary;
    private BigDecimal taxDeduction;
    private BigDecimal otherDeductions;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
    private String paymentStatus;
    private LocalDate paymentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PayrollResponse fromEntity(Payroll payroll) {
        PayrollResponse resp = new PayrollResponse();
        resp.setId(payroll.getId());
        resp.setMonth(payroll.getMonth());
        resp.setYear(payroll.getYear());
        resp.setBasicSalary(payroll.getBasicSalary());
        resp.setHra(payroll.getHra());
        resp.setAllowances(payroll.getAllowances());
        resp.setBonus(payroll.getBonus());
        resp.setOvertime(payroll.getOvertime());
        resp.setGrossSalary(payroll.getGrossSalary());
        resp.setTaxDeduction(payroll.getTaxDeduction());
        resp.setOtherDeductions(payroll.getOtherDeductions());
        resp.setTotalDeductions(payroll.getTotalDeductions());
        resp.setNetSalary(payroll.getNetSalary());
        resp.setPaymentStatus(payroll.getPaymentStatus());
        resp.setPaymentDate(payroll.getPaymentDate());
        resp.setCreatedAt(payroll.getCreatedAt());
        resp.setUpdatedAt(payroll.getUpdatedAt());

        if (payroll.getEmployee() != null) {
            resp.setEmployeeId(payroll.getEmployee().getId());
            resp.setEmployeeName(payroll.getEmployee().getFirstName() + " " + payroll.getEmployee().getLastName());
            resp.setEmployeeCode(payroll.getEmployee().getEmployeeCode());
            resp.setDesignation(payroll.getEmployee().getDesignation());
            if (payroll.getEmployee().getDepartment() != null) {
                resp.setDepartmentName(payroll.getEmployee().getDepartment().getName());
            }
        }

        return resp;
    }
}
