package com.hospital.repository;

import com.hospital.entity.Announcement;
import com.hospital.entity.Announcement.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByStatus(Status status);
}
