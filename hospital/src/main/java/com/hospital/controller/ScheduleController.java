package com.hospital.controller;

import com.hospital.entity.Schedule;
import com.hospital.entity.Doctor;
import com.hospital.entity.Department;
import com.hospital.model.Result;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public Result<List<Schedule>> list() {
        return Result.success(scheduleRepository.findAllWithDetails());
    }

    @GetMapping("/{id}")
    public Result<Schedule> get(@PathVariable Long id) {
        Optional<Schedule> schedule = scheduleRepository.findByIdWithDetails(id);
        return schedule.map(Result::success).orElseGet(() -> Result.error(404, "Schedule not found"));
    }

    @GetMapping("/date/{workDate}")
    public Result<List<Schedule>> listByDate(@PathVariable String workDate) {
        LocalDate date = LocalDate.parse(workDate);
        return Result.success(scheduleRepository.findByWorkDateWithDetails(date));
    }
    
    @PostMapping
    public Result<Schedule> create(@RequestBody Schedule schedule) {
        // 验证并加载医生和科室的完整信息
        Doctor doctor = doctorRepository.findById(schedule.getDoctor().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor not found"));
        
        Department department = departmentRepository.findById(schedule.getDepartment().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department not found"));
        
        // 时间冲突检测
        LocalDate workDate = schedule.getWorkDate();
        List<Schedule> existingSchedules = scheduleRepository.findByWorkDate(workDate);
        
        for (Schedule existing : existingSchedules) {
            if (existing.getDoctor().getId().equals(schedule.getDoctor().getId())) {
                // 检查时间是否重叠
                if (schedule.getStartTime().isBefore(existing.getEndTime()) && 
                    schedule.getEndTime().isAfter(existing.getStartTime())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Schedule conflict with existing schedule: " + existing.getId());
                }
            }
        }
        
        // 设置默认值
        if (schedule.getBooked() == null) {
            schedule.setBooked(0);
        }
        
        if (schedule.getStatus() == null) {
            schedule.setStatus(Schedule.ScheduleStatus.OPEN);
        }
        
        // 使用完整加载的医生和科室对象
        schedule.setDoctor(doctor);
        schedule.setDepartment(department);
        
        Schedule savedSchedule = scheduleRepository.save(schedule);
        return Result.success(savedSchedule);
    }
    
    @PutMapping("/{id}")
    public Result<Schedule> update(@PathVariable Long id, @RequestBody Schedule schedule) {
        // 查找现有的排班
        Schedule existingSchedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));
        
        // 验证并加载医生和科室的完整信息
        Doctor doctor = doctorRepository.findById(schedule.getDoctor().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor not found"));
        
        Department department = departmentRepository.findById(schedule.getDepartment().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department not found"));
        
        // 时间冲突检测（排除当前记录）
        LocalDate workDate = schedule.getWorkDate();
        List<Schedule> existingSchedules = scheduleRepository.findByWorkDate(workDate);
        
        for (Schedule existing : existingSchedules) {
            if (existing.getDoctor().getId().equals(schedule.getDoctor().getId()) && 
                !existing.getId().equals(id)) {
                // 检查时间是否重叠
                if (schedule.getStartTime().isBefore(existing.getEndTime()) && 
                    schedule.getEndTime().isAfter(existing.getStartTime())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Schedule conflict with existing schedule: " + existing.getId());
                }
            }
        }
        
        // 更新字段，使用完整加载的医生和科室对象
        existingSchedule.setDoctor(doctor);
        existingSchedule.setDepartment(department);
        existingSchedule.setWorkDate(schedule.getWorkDate());
        existingSchedule.setStartTime(schedule.getStartTime());
        existingSchedule.setEndTime(schedule.getEndTime());
        existingSchedule.setType(schedule.getType());
        existingSchedule.setStatus(schedule.getStatus());
        existingSchedule.setCapacity(schedule.getCapacity());
        
        Schedule updatedSchedule = scheduleRepository.save(existingSchedule);
        return Result.success(updatedSchedule);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        // 查找排班
        Schedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));
        
        // 检查是否有预约记录（如果有相关表的话）
        // 这里可以根据实际业务逻辑添加检查
        
        scheduleRepository.delete(schedule);
        return Result.success();
    }
}
