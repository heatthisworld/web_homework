package com.hospital.controller;

import com.hospital.entity.Department;
import com.hospital.model.Result;
import com.hospital.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
        return department.map(Result::success).orElseGet(() -> Result.error(404, "科室不存在或已被删除，请检查ID为 " + id + " 的科室是否存在"));
    }

    @PostMapping
    public Result<Department> create(@RequestBody Department department) {
        Department savedDepartment = departmentRepository.save(department);
        return Result.success(savedDepartment);
    }

    @PutMapping("/{id}")
    public Result<Department> update(@PathVariable Long id, @RequestBody Department department) {
        Optional<Department> existingDepartment = departmentRepository.findById(id);
        if (existingDepartment.isPresent()) {
            Department updatedDepartment = existingDepartment.get();
            updatedDepartment.setCode(department.getCode());
            updatedDepartment.setName(department.getName());
            updatedDepartment.setLeadName(department.getLeadName());
            updatedDepartment.setRooms(department.getRooms());
            updatedDepartment.setFocus(department.getFocus());
            updatedDepartment.setStatus(department.getStatus());
            return Result.success(departmentRepository.save(updatedDepartment));
        } else {
            return Result.error(404, "科室不存在或已被删除，请检查ID为 " + id + " 的科室是否存在");
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (departmentRepository.existsById(id)) {
            departmentRepository.deleteById(id);
            return Result.success();
        } else {
            return Result.error(404, "科室不存在或已被删除，请检查ID为 " + id + " 的科室是否存在");
        }
    }
}
