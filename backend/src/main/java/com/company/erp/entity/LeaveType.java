package com.company.erp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "leave_types")
@Getter
@Setter
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "annual_limit", nullable = false)
    private Integer annualLimit;

    @Column(nullable = false)
    private Boolean paid = true;

    private String status = "ACTIVE"; // ACTIVE, INACTIVE
}
