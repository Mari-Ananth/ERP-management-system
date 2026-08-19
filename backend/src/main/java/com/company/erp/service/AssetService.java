package com.company.erp.service;

import com.company.erp.dto.AssetAssignmentRequest;
import com.company.erp.dto.AssetAssignmentResponse;
import com.company.erp.dto.AssetRequest;
import com.company.erp.dto.AssetResponse;
import com.company.erp.dto.AssetReturnRequest;
import com.company.erp.entity.Asset;
import com.company.erp.entity.AssetAssignment;
import com.company.erp.entity.Employee;
import com.company.erp.exception.DuplicateResourceException;
import com.company.erp.exception.ResourceNotFoundException;
import com.company.erp.repository.AssetAssignmentRepository;
import com.company.erp.repository.AssetRepository;
import com.company.erp.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AssetAssignmentRepository assetAssignmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private AssetResponse mapToAssetResponse(Asset asset) {
        AssetResponse resp = AssetResponse.fromEntity(asset);
        Optional<AssetAssignment> currentAssign = assetAssignmentRepository.findByAssetIdAndReturnedDateIsNull(asset.getId());
        if (currentAssign.isPresent()) {
            AssetAssignment assignment = currentAssign.get();
            if (assignment.getEmployee() != null) {
                resp.setAssignedToEmployeeId(assignment.getEmployee().getId());
                resp.setAssignedToEmployeeName(assignment.getEmployee().getFirstName() + " " + assignment.getEmployee().getLastName());
            }
        }
        return resp;
    }

    @Transactional
    public AssetResponse createAsset(AssetRequest request) {
        if (assetRepository.existsByAssetCode(request.getAssetCode().toUpperCase())) {
            throw new DuplicateResourceException("Asset with code " + request.getAssetCode() + " already exists.");
        }

        Asset asset = new Asset();
        asset.setAssetCode(request.getAssetCode().toUpperCase());
        asset.setName(request.getName());
        asset.setType(request.getType().toUpperCase());
        asset.setBrand(request.getBrand());
        asset.setModel(request.getModel());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setPurchasePrice(request.getPurchasePrice());
        asset.setWarrantyExpiry(request.getWarrantyExpiry());
        asset.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "AVAILABLE");

        Asset saved = assetRepository.save(asset);
        return mapToAssetResponse(saved);
    }

    @Transactional
    public AssetResponse updateAsset(Long id, AssetRequest request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));

        if (assetRepository.existsByAssetCodeAndIdNot(request.getAssetCode().toUpperCase(), id)) {
            throw new DuplicateResourceException("Asset with code " + request.getAssetCode() + " already exists.");
        }

        asset.setAssetCode(request.getAssetCode().toUpperCase());
        asset.setName(request.getName());
        asset.setType(request.getType().toUpperCase());
        asset.setBrand(request.getBrand());
        asset.setModel(request.getModel());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setPurchasePrice(request.getPurchasePrice());
        asset.setWarrantyExpiry(request.getWarrantyExpiry());
        if (request.getStatus() != null) {
            asset.setStatus(request.getStatus().toUpperCase());
        }

        Asset saved = assetRepository.save(asset);
        return mapToAssetResponse(saved);
    }

    @Transactional(readOnly = true)
    public AssetResponse getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));
        return mapToAssetResponse(asset);
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> getAllAssets(String search, String type, String status) {
        String t = type != null ? type.toUpperCase() : null;
        String s = status != null ? status.toUpperCase() : null;
        return assetRepository.findAssetsWithFilters(search, t, s).stream()
                .map(this::mapToAssetResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssetAssignmentResponse assignAsset(Long assetId, AssetAssignmentRequest request, Long assignerEmployeeId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new IllegalArgumentException("Asset cannot be assigned because its current status is: " + asset.getStatus());
        }

        Employee emp = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getEmployeeId()));

        Employee assigner = employeeRepository.findById(assignerEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Assigner employee not found with ID: " + assignerEmployeeId));

        AssetAssignment assignment = new AssetAssignment();
        assignment.setAsset(asset);
        assignment.setEmployee(emp);
        assignment.setAssignedDate(LocalDate.now());
        assignment.setAssignedBy(assigner);
        assignment.setNotes(request.getNotes());

        asset.setStatus("ASSIGNED");
        assetRepository.save(asset);

        AssetAssignment saved = assetAssignmentRepository.save(assignment);
        return AssetAssignmentResponse.fromEntity(saved);
    }

    @Transactional
    public AssetAssignmentResponse returnAsset(Long assetId, AssetReturnRequest request) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        if (!"ASSIGNED".equals(asset.getStatus())) {
            throw new IllegalArgumentException("Asset cannot be returned because it is not currently assigned.");
        }

        AssetAssignment assignment = assetAssignmentRepository.findByAssetIdAndReturnedDateIsNull(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Active assignment record not found for asset ID: " + assetId));

        assignment.setReturnedDate(LocalDate.now());
        assignment.setReturnCondition(request.getReturnCondition());
        if (request.getNotes() != null) {
            assignment.setNotes(assignment.getNotes() + " | Return notes: " + request.getNotes());
        }

        asset.setStatus("AVAILABLE"); 
        assetRepository.save(asset);

        AssetAssignment saved = assetAssignmentRepository.save(assignment);
        return AssetAssignmentResponse.fromEntity(saved);
    }

    @Transactional
    public AssetResponse moveToMaintenance(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        if ("ASSIGNED".equals(asset.getStatus())) {
            throw new IllegalArgumentException("Asset is currently assigned. It must be returned before putting under maintenance.");
        }

        asset.setStatus("MAINTENANCE");
        Asset saved = assetRepository.save(asset);
        return mapToAssetResponse(saved);
    }

    @Transactional
    public AssetResponse retireAsset(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        if ("ASSIGNED".equals(asset.getStatus())) {
            throw new IllegalArgumentException("Asset is currently assigned. It must be returned before retiring.");
        }

        asset.setStatus("RETIRED");
        Asset saved = assetRepository.save(asset);
        return mapToAssetResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AssetAssignmentResponse> getEmployeeAssets(Long employeeId) {
        return assetAssignmentRepository.findByEmployeeIdAndReturnedDateIsNull(employeeId).stream()
                .map(AssetAssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssetAssignmentResponse> getAssetHistory(Long assetId) {
        return assetAssignmentRepository.findByAssetId(assetId).stream()
                .map(AssetAssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
