package com.company.erp.controller;

import com.company.erp.dto.*;
import com.company.erp.entity.User;
import com.company.erp.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AssetResponse> createAsset(@Valid @RequestBody AssetRequest request) {
        AssetResponse response = assetService.createAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request
    ) {
        AssetResponse response = assetService.updateAsset(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AssetResponse> getAssetById(@PathVariable Long id) {
        AssetResponse response = assetService.getAssetById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AssetResponse>> getAllAssets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status
    ) {
        List<AssetResponse> response = assetService.getAllAssets(search, type, status);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AssetAssignmentResponse> assignAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetAssignmentRequest request,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        AssetAssignmentResponse response = assetService.assignAsset(id, request, currentUser.getEmployee().getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AssetAssignmentResponse> returnAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetReturnRequest request
    ) {
        AssetAssignmentResponse response = assetService.returnAsset(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/maintenance")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AssetResponse> moveToMaintenance(@PathVariable Long id) {
        AssetResponse response = assetService.moveToMaintenance(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/retire")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetResponse> retireAsset(@PathVariable Long id) {
        AssetResponse response = assetService.retireAsset(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<AssetAssignmentResponse>> getAssetHistory(@PathVariable Long id) {
        List<AssetAssignmentResponse> response = assetService.getAssetHistory(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'FINANCE', 'EMPLOYEE')")
    public ResponseEntity<List<AssetAssignmentResponse>> getMyAssets(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser.getEmployee() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        List<AssetAssignmentResponse> response = assetService.getEmployeeAssets(currentUser.getEmployee().getId());
        return ResponseEntity.ok(response);
    }
}
