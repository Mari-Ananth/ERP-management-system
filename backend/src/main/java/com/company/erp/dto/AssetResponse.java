package com.company.erp.dto;

import com.company.erp.entity.Asset;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class AssetResponse {
    private Long id;
    private String assetCode;
    private String name;
    private String type;
    private String brand;
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private BigDecimal purchasePrice;
    private LocalDate warrantyExpiry;
    private String status;
    private Long assignedToEmployeeId;
    private String assignedToEmployeeName;

    public static AssetResponse fromEntity(Asset asset) {
        AssetResponse resp = new AssetResponse();
        resp.setId(asset.getId());
        resp.setAssetCode(asset.getAssetCode());
        resp.setName(asset.getName());
        resp.setType(asset.getType());
        resp.setBrand(asset.getBrand());
        resp.setModel(asset.getModel());
        resp.setSerialNumber(asset.getSerialNumber());
        resp.setPurchaseDate(asset.getPurchaseDate());
        resp.setPurchasePrice(asset.getPurchasePrice());
        resp.setWarrantyExpiry(asset.getWarrantyExpiry());
        resp.setStatus(asset.getStatus());
        return resp;
    }
}
