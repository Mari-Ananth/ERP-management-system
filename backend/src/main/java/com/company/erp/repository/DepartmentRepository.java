package com.company.erp.repository;

import com.company.erp.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    Boolean existsByName(String name);
    
    Optional<Department> findByDepartmentCode(String departmentCode);
    Boolean existsByDepartmentCode(String departmentCode);
    
    Boolean existsByNameAndIdNot(String name, Long id);
    Boolean existsByDepartmentCodeAndIdNot(String departmentCode, Long id);

    @Query("SELECT d FROM Department d WHERE " +
           "(:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.departmentCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Department> findDepartmentsWithFilters(@Param("search") String search);
}
