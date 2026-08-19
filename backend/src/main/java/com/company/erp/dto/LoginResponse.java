package com.company.erp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private Long id;

    public LoginResponse(String token, String email, String role, String firstName, String lastName, Long id) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.id = id;
    }
}
