package com.company.erp.dto;

import com.company.erp.entity.AssetAssignment;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AssetAssignmentResponse {
    private Long id;
    private Long assetId;
    private String assetName;
    private String assetCode;
    private String assetType;
    private Long employeeId;
    private String employeeName;
    private LocalDate assignedDate;
    private LocalDate returnedDate;
    private String assignedByName;
    private String returnCondition;
    private String notes;

    public static AssetAssignmentResponse fromEntity(AssetAssignment assignment) {
        AssetAssignmentResponse resp = new AssetAssignmentResponse();
        resp.setId(assignment.getId());
        resp.setAssignedDate(assignment.getAssignedDate());
        resp.setReturnedDate(assignment.getReturnedDate());
        resp.setReturnCondition(assignment.getReturnCondition());
        resp.setNotes(assignment.getNotes());

        if (assignment.getAsset() != null) {
            resp.setAssetId(assignment.getAsset().getId());
            resp.setAssetName(assignment.getAsset().getName());
            resp.setAssetCode(assignment.getAsset().getAssetCode());
            resp.setAssetType(assignment.getAsset().getType());
        }

        if (assignment.getEmployee() != null) {
            resp.setEmployeeId(assignment.getEmployee().getId());
            resp.setEmployeeName(assignment.getEmployee().getFirstName() + " " + assignment.getEmployee().getLastName());
        }

        if (assignment.getAssignedBy() != null) {
            resp.setAssignedByName(assignment.getAssignedBy().getFirstName() + " " + assignment.getAssignedBy().getLastName());
        }

        return resp;
    }
}
