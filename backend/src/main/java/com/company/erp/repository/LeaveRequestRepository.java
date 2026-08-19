package com.company.erp.repository;

import com.company.erp.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    
    List<LeaveRequest> findByEmployeeManagerId(Long managerId);
    
    @Query("SELECT COUNT(lr) > 0 FROM LeaveRequest lr WHERE lr.employee.id = :employeeId " +
           "AND lr.status IN ('PENDING', 'APPROVED') " +
           "AND (:startDate <= lr.endDate) AND (:endDate >= lr.startDate)")
    Boolean existsOverlappingRequest(
           @Param("employeeId") Long employeeId,
           @Param("startDate") LocalDate startDate,
           @Param("endDate") LocalDate endDate
    );

    @Query("SELECT lr FROM LeaveRequest lr WHERE " +
           "(:employeeId IS NULL OR lr.employee.id = :employeeId) AND " +
           "(:departmentId IS NULL OR lr.employee.department.id = :departmentId) AND " +
           "(:leaveTypeId IS NULL OR lr.leaveType.id = :leaveTypeId) AND " +
           "(:status IS NULL OR lr.status = :status) AND " +
           "(:startDate IS NULL OR lr.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR lr.endDate <= :endDate)")
    List<LeaveRequest> findRequestsWithFilters(
           @Param("employeeId") Long employeeId,
           @Param("departmentId") Long departmentId,
           @Param("leaveTypeId") Long leaveTypeId,
           @Param("status") String status,
           @Param("startDate") LocalDate startDate,
           @Param("endDate") LocalDate endDate
    );
}
