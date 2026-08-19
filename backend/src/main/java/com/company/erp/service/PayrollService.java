package com.company.erp.service;

import com.company.erp.dto.PayrollRequest;
import com.company.erp.dto.PayrollResponse;
import com.company.erp.entity.Employee;
import com.company.erp.entity.Payroll;
import com.company.erp.exception.DuplicateResourceException;
import com.company.erp.exception.ResourceNotFoundException;
import com.company.erp.repository.EmployeeRepository;
import com.company.erp.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private void calculateAndSetSalaries(Payroll p) {
        BigDecimal gross = p.getBasicSalary()
                .add(p.getHra())
                .add(p.getAllowances())
                .add(p.getBonus())
                .add(p.getOvertime());

        BigDecimal deductions = p.getTaxDeduction()
                .add(p.getOtherDeductions());

        BigDecimal net = gross.subtract(deductions);

        if (gross.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Gross salary cannot be negative.");
        }
        if (net.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Net salary cannot be negative.");
        }

        p.setGrossSalary(gross);
        p.setTotalDeductions(deductions);
        p.setNetSalary(net);
    }

    private void setDefaultsForEmployee(Payroll p, Employee emp) {
        BigDecimal basic = new BigDecimal("45000");
        BigDecimal hra = new BigDecimal("15000");
        BigDecimal allowances = new BigDecimal("5000");
        BigDecimal tax = new BigDecimal("4000");

        String des = emp.getDesignation() != null ? emp.getDesignation().toUpperCase() : "";
        if (des.contains("MANAGER") || des.contains("HEAD") || des.contains("LEAD")) {
            basic = new BigDecimal("80000");
            hra = new BigDecimal("25000");
            allowances = new BigDecimal("8000");
            tax = new BigDecimal("9000");
        } else if (des.contains("SENIOR") || des.contains("SR")) {
            basic = new BigDecimal("60000");
            hra = new BigDecimal("20000");
            allowances = new BigDecimal("6000");
            tax = new BigDecimal("6000");
        } else if (des.contains("INTERN")) {
            basic = new BigDecimal("20000");
            hra = new BigDecimal("5000");
            allowances = new BigDecimal("1000");
            tax = new BigDecimal("1000");
        }

        p.setBasicSalary(basic);
        p.setHra(hra);
        p.setAllowances(allowances);
        p.setBonus(BigDecimal.ZERO);
        p.setOvertime(BigDecimal.ZERO);
        p.setTaxDeduction(tax);
        p.setOtherDeductions(BigDecimal.ZERO);
    }

    @Transactional
    public PayrollResponse createPayroll(PayrollRequest request) {
        if (payrollRepository.existsByEmployeeIdAndMonthAndYear(request.getEmployeeId(), request.getMonth().toUpperCase(), request.getYear())) {
            throw new DuplicateResourceException("Payroll for employee ID " + request.getEmployeeId() + " already exists for " + request.getMonth() + " " + request.getYear());
        }

        Employee emp = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getEmployeeId()));

        Payroll p = new Payroll();
        p.setEmployee(emp);
        p.setMonth(request.getMonth().toUpperCase());
        p.setYear(request.getYear());
        p.setBasicSalary(request.getBasicSalary());
        p.setHra(request.getHra());
        p.setAllowances(request.getAllowances());
        p.setBonus(request.getBonus());
        p.setOvertime(request.getOvertime());
        p.setTaxDeduction(request.getTaxDeduction());
        p.setOtherDeductions(request.getOtherDeductions());
        p.setPaymentStatus("PENDING");

        calculateAndSetSalaries(p);

        Payroll saved = payrollRepository.save(p);
        return PayrollResponse.fromEntity(saved);
    }

    @Transactional
    public List<PayrollResponse> generateMonthlyPayroll(String month, Integer year) {
        String m = month.toUpperCase();
        // Fetch all active employees
        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(emp -> "ACTIVE".equalsIgnoreCase(emp.getEmploymentStatus()))
                .collect(Collectors.toList());

        List<PayrollResponse> generated = new ArrayList<>();

        for (Employee emp : employees) {

            if (!payrollRepository.existsByEmployeeIdAndMonthAndYear(emp.getId(), m, year)) {
                Payroll p = new Payroll();
                p.setEmployee(emp);
                p.setMonth(m);
                p.setYear(year);
                p.setPaymentStatus("PENDING");
                
                setDefaultsForEmployee(p, emp);
                calculateAndSetSalaries(p);
                
                Payroll saved = payrollRepository.save(p);
                generated.add(PayrollResponse.fromEntity(saved));
            }
        }
        return generated;
    }

    @Transactional
    public PayrollResponse updatePayroll(Long id, PayrollRequest request) {
        Payroll p = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found with ID: " + id));

        p.setBasicSalary(request.getBasicSalary());
        p.setHra(request.getHra());
        p.setAllowances(request.getAllowances());
        p.setBonus(request.getBonus());
        p.setOvertime(request.getOvertime());
        p.setTaxDeduction(request.getTaxDeduction());
        p.setOtherDeductions(request.getOtherDeductions());

        calculateAndSetSalaries(p);

        Payroll saved = payrollRepository.save(p);
        return PayrollResponse.fromEntity(saved);
    }

    @Transactional
    public PayrollResponse markAsPaid(Long id) {
        Payroll p = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found with ID: " + id));

        p.setPaymentStatus("PAID");
        p.setPaymentDate(LocalDate.now());

        Payroll saved = payrollRepository.save(p);
        return PayrollResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PayrollResponse getPayrollById(Long id) {
        Payroll p = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found with ID: " + id));
        return PayrollResponse.fromEntity(p);
    }

    @Transactional(readOnly = true)
    public List<PayrollResponse> getPayrollsWithFilters(Long employeeId, Long departmentId, String month, Integer year, String status) {
        String m = month != null ? month.toUpperCase() : null;
        return payrollRepository.findPayrollsWithFilters(employeeId, departmentId, m, year, status).stream()
                .map(PayrollResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PayrollResponse> getEmployeePayrollHistory(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId).stream()
                .map(PayrollResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
