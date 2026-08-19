package com.company.erp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class AssetRequest {

    @NotBlank(message = "Asset code is required")
    private String assetCode;

    @NotBlank(message = "Asset name is required")
    private String name;

    @NotBlank(message = "Asset type is required")
    private String type; // LAPTOP, DESKTOP, MONITOR, MOBILE, KEYBOARD, MOUSE, ID_CARD, OTHER

    private String brand;

    private String model;

    private String serialNumber;

    private LocalDate purchaseDate;

    @DecimalMin(value = "0.0", message = "Purchase price cannot be negative")
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    private LocalDate warrantyExpiry;

    private String status = "AVAILABLE"; // AVAILABLE, ASSIGNED, MAINTENANCE, RETURNED, RETIRED
}
