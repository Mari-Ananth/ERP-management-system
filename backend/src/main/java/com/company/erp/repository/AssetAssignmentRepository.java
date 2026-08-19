package com.company.erp.repository;

import com.company.erp.entity.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {
    List<AssetAssignment> findByEmployeeId(Long employeeId);
    
    List<AssetAssignment> findByAssetId(Long assetId);
    
    List<AssetAssignment> findByEmployeeIdAndReturnedDateIsNull(Long employeeId);
    
    Optional<AssetAssignment> findByAssetIdAndReturnedDateIsNull(Long assetId);
}
