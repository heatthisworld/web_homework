package com.hospital.controller;

import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.model.Result;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;

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
    
    /**
     * 获取科室的医生列表
     */
    @GetMapping("/{id}/doctors")
    public Result<List<Doctor>> getDepartmentDoctors(@PathVariable Long id) {
        Optional<Department> department = departmentRepository.findById(id);
        if (department.isPresent()) {
            List<Doctor> doctors = doctorRepository.findByDepartment(department.get());
            return Result.success(doctors);
        } else {
            return Result.error(404, "科室不存在或已被删除，请检查ID为 " + id + " 的科室是否存在");
        }
    }
    
    /**
     * 更新科室的医生分配
     */
    @PutMapping("/{id}/doctors")
    public Result<Department> updateDepartmentDoctors(@PathVariable Long id, @RequestBody Map<String, List<Long>> request) {
        Optional<Department> departmentOpt = departmentRepository.findById(id);
        if (!departmentOpt.isPresent()) {
            return Result.error(404, "科室不存在或已被删除，请检查ID为 " + id + " 的科室是否存在");
        }
        
        Department department = departmentOpt.get();
        List<Long> doctorIds = request.get("doctorIds");
        
        if (doctorIds == null) {
            return Result.error(400, "请求参数错误，缺少doctorIds字段");
        }
        
        // 获取所有要分配的医生
        List<Doctor> doctors = doctorRepository.findAllById(doctorIds);
        
        // 更新每个医生的科室
        for (Doctor doctor : doctors) {
            doctor.setDepartment(department);
        }
        doctorRepository.saveAll(doctors);
        
        // 更新科室信息
        department.setUpdatedAt(java.time.LocalDateTime.now());
        department = departmentRepository.save(department);
        
        return Result.success(department);
    }
}
