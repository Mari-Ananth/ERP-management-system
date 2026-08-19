package com.company.erp.database;

import com.company.erp.entity.Department;
import com.company.erp.entity.Employee;
import com.company.erp.entity.Role;
import com.company.erp.entity.User;
import com.company.erp.repository.DepartmentRepository;
import com.company.erp.repository.EmployeeRepository;
import com.company.erp.entity.LeaveType;
import com.company.erp.repository.LeaveTypeRepository;
import com.company.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            Department itDept = departmentRepository.findByName("IT").orElseGet(() -> {
                Department newDept = new Department();
                newDept.setDepartmentCode("IT");
                newDept.setName("IT");
                newDept.setDescription("Information Technology Department");
                newDept.setStatus("ACTIVE");
                return departmentRepository.save(newDept);
            });

            Employee adminEmployee = employeeRepository.findByEmail("admin@company.com").orElseGet(() -> {
                Employee newEmp = new Employee();
                newEmp.setEmployeeCode("EMP1001");
                newEmp.setFirstName("System");
                newEmp.setLastName("Admin");
                newEmp.setEmail("admin@company.com");
                newEmp.setPhone("+1234567890");
                newEmp.setDesignation("IT Administrator");
                newEmp.setJoiningDate(LocalDate.now());
                newEmp.setDateOfBirth(LocalDate.of(1990, 1, 1));
                newEmp.setGender("Male");
                newEmp.setAddress("Company Headquarters");
                newEmp.setEmploymentType("FULL_TIME");
                newEmp.setEmploymentStatus("ACTIVE");
                newEmp.setDepartment(itDept);
                return employeeRepository.save(newEmp);
            });

          
            User adminUser = new User();
            adminUser.setEmail("admin@company.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRole(Role.ADMIN);
            adminUser.setEnabled(true);
            adminUser.setEmployee(adminEmployee);

            userRepository.save(adminUser);

          
            Employee regularEmployee = employeeRepository.findByEmail("employee@company.com").orElseGet(() -> {
                Employee newEmp = new Employee();
                newEmp.setEmployeeCode("EMP1002");
                newEmp.setFirstName("John");
                newEmp.setLastName("Doe");
                newEmp.setEmail("employee@company.com");
                newEmp.setPhone("+1987654321");
                newEmp.setDesignation("Software Engineer");
                newEmp.setJoiningDate(LocalDate.now());
                newEmp.setDateOfBirth(LocalDate.of(1995, 5, 15));
                newEmp.setGender("Male");
                newEmp.setAddress("Employee Residence");
                newEmp.setEmploymentType("FULL_TIME");
                newEmp.setEmploymentStatus("ACTIVE");
                newEmp.setDepartment(itDept);
                return employeeRepository.save(newEmp);
            });

            User employeeUser = new User();
            employeeUser.setEmail("employee@company.com");
            employeeUser.setPassword(passwordEncoder.encode("employee123"));
            employeeUser.setRole(Role.EMPLOYEE);
            employeeUser.setEnabled(true);
            employeeUser.setEmployee(regularEmployee);

            userRepository.save(employeeUser);
            itDept.setManager(adminEmployee);
            departmentRepository.save(itDept);

            System.out.println("==========================================================================");
            System.out.println("DEFAULT DATABASE SEED COMPLETED:");
            System.out.println("Default Department: IT");
            System.out.println("Default Admin User: admin@company.com / admin123");
            System.out.println("Default Employee User: employee@company.com / employee123");
            System.out.println("==========================================================================");
        } else {
            System.out.println("Database already seeded. Skipping seeder.");
        }

        if (leaveTypeRepository.count() == 0) {
            LeaveType casual = new LeaveType();
            casual.setName("CASUAL");
            casual.setDescription("Casual Leave");
            casual.setAnnualLimit(12);
            casual.setPaid(true);
            casual.setStatus("ACTIVE");
            leaveTypeRepository.save(casual);

            LeaveType sick = new LeaveType();
            sick.setName("SICK");
            sick.setDescription("Sick Leave");
            sick.setAnnualLimit(10);
            sick.setPaid(true);
            sick.setStatus("ACTIVE");
            leaveTypeRepository.save(sick);

            LeaveType vacation = new LeaveType();
            vacation.setName("VACATION");
            vacation.setDescription("Vacation Leave");
            vacation.setAnnualLimit(15);
            vacation.setPaid(true);
            vacation.setStatus("ACTIVE");
            leaveTypeRepository.save(vacation);

            LeaveType unpaid = new LeaveType();
            unpaid.setName("UNPAID");
            unpaid.setDescription("Unpaid Leave");
            unpaid.setAnnualLimit(30);
            unpaid.setPaid(false);
            unpaid.setStatus("ACTIVE");
            leaveTypeRepository.save(unpaid);

            System.out.println("Leave types seeded successfully!");
        }
    }
}
