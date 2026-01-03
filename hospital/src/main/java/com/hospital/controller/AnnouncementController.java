package com.hospital.controller;

import com.hospital.entity.Announcement;
import com.hospital.model.Result;
import com.hospital.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public Result<Announcement> create(@RequestBody Announcement announcement) {
        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return Result.success(savedAnnouncement);
    }

    @PutMapping("/{id}")
    public Result<Announcement> update(@PathVariable Long id, @RequestBody Announcement announcement) {
        Optional<Announcement> existingAnnouncement = announcementRepository.findById(id);
        if (existingAnnouncement.isPresent()) {
            Announcement updatedAnnouncement = existingAnnouncement.get();
            updatedAnnouncement.setTitle(announcement.getTitle());
            updatedAnnouncement.setContent(announcement.getContent());
            updatedAnnouncement.setStatus(announcement.getStatus());
            updatedAnnouncement.setAudienceScope(announcement.getAudienceScope());
            updatedAnnouncement.setPublishAt(announcement.getPublishAt());
            updatedAnnouncement.setCreator(announcement.getCreator());
            announcementRepository.save(updatedAnnouncement);
            return Result.success(updatedAnnouncement);
        } else {
            return Result.error(404, "Announcement not found");
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (announcementRepository.existsById(id)) {
            announcementRepository.deleteById(id);
            return Result.success();
        } else {
            return Result.error(404, "Announcement not found");
        }
    }
}
