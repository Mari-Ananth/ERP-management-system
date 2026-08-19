package com.company.erp.service;

import com.company.erp.dto.DepartmentRequest;
import com.company.erp.dto.DepartmentResponse;
import com.company.erp.dto.EmployeeResponse;
import com.company.erp.entity.Department;
import com.company.erp.entity.Employee;
import com.company.erp.entity.User;
import com.company.erp.exception.DuplicateResourceException;
import com.company.erp.exception.ResourceNotFoundException;
import com.company.erp.repository.DepartmentRepository;
import com.company.erp.repository.EmployeeRepository;
import com.company.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Department with name '" + request.getName() + "' already exists.");
        }
        if (departmentRepository.existsByDepartmentCode(request.getDepartmentCode())) {
            throw new DuplicateResourceException("Department with code '" + request.getDepartmentCode() + "' already exists.");
        }

        Department dept = new Department();
        dept.setDepartmentCode(request.getDepartmentCode().toUpperCase());
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        dept.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + request.getManagerId()));
            dept.setManager(manager);
        }

        Department savedDept = departmentRepository.save(dept);
        return DepartmentResponse.fromEntity(savedDept);
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return DepartmentResponse.fromEntity(dept);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments(String search) {
        List<Department> departments = departmentRepository.findDepartmentsWithFilters(search);
        return departments.stream()
                .map(DepartmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        if (departmentRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Department with name '" + request.getName() + "' already exists.");
        }
        if (departmentRepository.existsByDepartmentCodeAndIdNot(request.getDepartmentCode(), id)) {
            throw new DuplicateResourceException("Department with code '" + request.getDepartmentCode() + "' already exists.");
        }

        dept.setDepartmentCode(request.getDepartmentCode().toUpperCase());
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            dept.setStatus(request.getStatus());
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + request.getManagerId()));
            dept.setManager(manager);
        } else {
            dept.setManager(null);
        }

        Department savedDept = departmentRepository.save(dept);
        return DepartmentResponse.fromEntity(savedDept);
    }

    @Transactional
    public DepartmentResponse changeStatus(Long id, String status) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        dept.setStatus(status);
        Department savedDept = departmentRepository.save(dept);
        return DepartmentResponse.fromEntity(savedDept);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        if (dept.getEmployees() != null && !dept.getEmployees().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete department because it contains employees. Reassign employees first.");
        }

        departmentRepository.delete(dept);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesByDepartmentId(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        return dept.getEmployees().stream()
                .map(emp -> {
                    User user = userRepository.findByEmail(emp.getEmail()).orElse(null);
                    return EmployeeResponse.fromEntity(emp, user);
                })
                .collect(Collectors.toList());
    }
}
