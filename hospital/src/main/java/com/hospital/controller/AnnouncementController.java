package com.hospital.controller;

import com.hospital.entity.Announcement;
import com.hospital.model.Result;
import com.hospital.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping
    public Result<List<Announcement>> list() {
        return Result.success(announcementRepository.findAll());
    }

    @GetMapping("/{id}")
    public Result<Announcement> get(@PathVariable Long id) {
        Optional<Announcement> announcement = announcementRepository.findById(id);
        return announcement.map(Result::success).orElseGet(() -> Result.error(404, "Announcement not found"));
    }
}
