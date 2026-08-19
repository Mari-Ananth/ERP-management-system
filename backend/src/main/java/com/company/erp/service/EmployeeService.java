package com.company.erp.service;

import com.company.erp.dto.EmployeeRequest;
import com.company.erp.dto.EmployeeResponse;
import com.company.erp.entity.Department;
import com.company.erp.entity.Employee;
import com.company.erp.entity.Role;
import com.company.erp.entity.User;
import com.company.erp.exception.DuplicateResourceException;
import com.company.erp.exception.ResourceNotFoundException;
import com.company.erp.repository.DepartmentRepository;
import com.company.erp.repository.EmployeeRepository;
import com.company.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private synchronized String generateEmployeeCode() {
        long count = employeeRepository.count();
        return "EMP-" + String.format("%04d", 1001 + count);
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Employee with email " + request.getEmail() + " already exists.");
        }

        Employee emp = new Employee();
        emp.setEmployeeCode(generateEmployeeCode());
        emp.setFirstName(request.getFirstName());
        emp.setLastName(request.getLastName());
        emp.setEmail(request.getEmail());
        emp.setPhone(request.getPhone());
        emp.setDateOfBirth(request.getDateOfBirth());
        emp.setGender(request.getGender());
        emp.setAddress(request.getAddress());
        emp.setJoiningDate(request.getJoiningDate());
        emp.setDesignation(request.getDesignation());
        emp.setEmploymentType(request.getEmploymentType());
        emp.setEmploymentStatus(request.getEmploymentStatus());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
            emp.setDepartment(dept);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + request.getManagerId()));
            emp.setManager(manager);
        }

        Employee savedEmp = employeeRepository.save(emp);

        // Create associated login credentials
        User user = new User();
        user.setEmail(request.getEmail());
        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank()) 
                ? request.getPassword() 
                : "Welcome123";
        user.setPassword(passwordEncoder.encode(rawPassword));
        
        Role userRole;
        try {
            userRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            userRole = Role.EMPLOYEE;
        }
        user.setRole(userRole);
        user.setEnabled(true);
        user.setEmployee(savedEmp);
        
        userRepository.save(user);

        return EmployeeResponse.fromEntity(savedEmp, user);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        User user = userRepository.findByEmail(emp.getEmail()).orElse(null);
        return EmployeeResponse.fromEntity(emp, user);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAllEmployees(String search, Long departmentId, Long managerId, String status, Pageable pageable) {
        Page<Employee> employees = employeeRepository.findEmployeesWithFilters(search, departmentId, managerId, status, pageable);
        return employees.map(emp -> {
            User user = userRepository.findByEmail(emp.getEmail()).orElse(null);
            return EmployeeResponse.fromEntity(emp, user);
        });
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        
        User user = userRepository.findByEmail(emp.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User login credentials not found for email: " + emp.getEmail()));

        if (!emp.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (employeeRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Employee with email " + request.getEmail() + " already exists.");
            }
            emp.setEmail(request.getEmail());
            user.setEmail(request.getEmail());
        }

        emp.setFirstName(request.getFirstName());
        emp.setLastName(request.getLastName());
        emp.setPhone(request.getPhone());
        emp.setDateOfBirth(request.getDateOfBirth());
        emp.setGender(request.getGender());
        emp.setAddress(request.getAddress());
        emp.setJoiningDate(request.getJoiningDate());
        emp.setDesignation(request.getDesignation());
        emp.setEmploymentType(request.getEmploymentType());
        emp.setEmploymentStatus(request.getEmploymentStatus());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
            emp.setDepartment(dept);
        } else {
            emp.setDepartment(null);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with ID: " + request.getManagerId()));
            emp.setManager(manager);
        } else {
            emp.setManager(null);
        }

        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Employee savedEmp = employeeRepository.save(emp);
        userRepository.save(user);

        return EmployeeResponse.fromEntity(savedEmp, user);
    }

    @Transactional
    public EmployeeResponse updateProfile(Long id, EmployeeRequest request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        emp.setPhone(request.getPhone());
        emp.setAddress(request.getAddress());

        Employee savedEmp = employeeRepository.save(emp);
        User user = userRepository.findByEmail(emp.getEmail()).orElse(null);
        return EmployeeResponse.fromEntity(savedEmp, user);
    }

    @Transactional
    public EmployeeResponse deactivateEmployee(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        emp.setEmploymentStatus("TERMINATED");
        
        Optional<User> userOpt = userRepository.findByEmail(emp.getEmail());
        User user = null;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            user.setEnabled(false); // disable login credentials!
            userRepository.save(user);
        }

        Employee savedEmp = employeeRepository.save(emp);
        return EmployeeResponse.fromEntity(savedEmp, user);
    }
}
