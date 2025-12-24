package com.hospital.controller;

import com.hospital.entity.Department;
import com.hospital.model.Result;
import com.hospital.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public Result<List<Department>> list() {
        return Result.success(departmentRepository.findAll());
    }

    @GetMapping("/{id}")
    public Result<Department> get(@PathVariable Long id) {
        Optional<Department> department = departmentRepository.findById(id);
        return department.map(Result::success).orElseGet(() -> Result.error(404, "Department not found"));
    }
}
