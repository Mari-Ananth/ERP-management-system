package com.company.erp.repository;

import com.company.erp.entity.Role;
import com.company.erp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.employee.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.employee.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.employee.lastName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:enabled IS NULL OR u.enabled = :enabled)")
    List<User> findUsersWithFilters(
            @Param("search") String search,
            @Param("role") Role role,
            @Param("enabled") Boolean enabled
    );
}
