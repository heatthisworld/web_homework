package com.hospital.service.impl;

import com.hospital.entity.Announcement;
import com.hospital.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementServiceImpl {

    @Autowired
    private AnnouncementRepository announcementRepository;

    /**
     * 每分钟检查一次，将达到发布时间的预告公告更新为已发布状态
     */
    @Scheduled(cron = "0 * * * * ?") // 每分钟执行一次
    public void updateScheduledAnnouncements() {
        LocalDateTime now = LocalDateTime.now();
        List<Announcement> scheduledAnnouncements = announcementRepository.findByStatus(Announcement.Status.SCHEDULED);
        
        for (Announcement announcement : scheduledAnnouncements) {
            if (announcement.getPublishAt() != null && announcement.getPublishAt().isBefore(now)) {
                announcement.setStatus(Announcement.Status.PUBLISHED);
                announcementRepository.save(announcement);
            }
        }
    }
}