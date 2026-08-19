package com.company.erp.repository;

import com.company.erp.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployeeId(Long employeeId);
    
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, String month, Integer year);
    
    Boolean existsByEmployeeIdAndMonthAndYear(Long employeeId, String month, Integer year);

    @Query("SELECT p FROM Payroll p WHERE " +
           "(:employeeId IS NULL OR p.employee.id = :employeeId) AND " +
           "(:departmentId IS NULL OR p.employee.department.id = :departmentId) AND " +
           "(:month IS NULL OR p.month = :month) AND " +
           "(:year IS NULL OR p.year = :year) AND " +
           "(:paymentStatus IS NULL OR p.paymentStatus = :paymentStatus)")
    List<Payroll> findPayrollsWithFilters(
           @Param("employeeId") Long employeeId,
           @Param("departmentId") Long departmentId,
           @Param("month") String month,
           @Param("year") Integer year,
           @Param("paymentStatus") String paymentStatus
    );
}
