package com.company.erp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssetReturnRequest {

    @NotBlank(message = "Return condition is required")
    private String returnCondition;

    private String notes;
}
