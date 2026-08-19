package com.company.erp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageResponse {
    private String status;
    private String message;

    public MessageResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }
}
