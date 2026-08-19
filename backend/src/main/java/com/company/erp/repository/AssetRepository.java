package com.company.erp.repository;

import com.company.erp.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByAssetCode(String assetCode);
    Boolean existsByAssetCode(String assetCode);
    Boolean existsByAssetCodeAndIdNot(String assetCode, Long id);

    @Query("SELECT a FROM Asset a WHERE " +
           "(:search IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.assetCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:type IS NULL OR a.type = :type) AND " +
           "(:status IS NULL OR a.status = :status)")
    List<Asset> findAssetsWithFilters(
           @Param("search") String search,
           @Param("type") String type,
           @Param("status") String status
    );
}
