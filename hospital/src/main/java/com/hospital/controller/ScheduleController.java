package com.hospital.controller;

import com.hospital.entity.Schedule;
import com.hospital.model.Result;
import com.hospital.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @GetMapping
    public Result<List<Schedule>> list() {
        return Result.success(scheduleRepository.findAll());
    }

    @GetMapping("/{id}")
    public Result<Schedule> get(@PathVariable Long id) {
        Optional<Schedule> schedule = scheduleRepository.findById(id);
        return schedule.map(Result::success).orElseGet(() -> Result.error(404, "Schedule not found"));
    }

    @GetMapping("/date/{workDate}")
    public Result<List<Schedule>> listByDate(@PathVariable String workDate) {
        LocalDate date = LocalDate.parse(workDate);
        return Result.success(scheduleRepository.findByWorkDate(date));
    }
}
