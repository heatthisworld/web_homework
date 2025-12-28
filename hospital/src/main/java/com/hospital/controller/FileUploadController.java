package com.hospital.controller;

import com.hospital.model.Result;
import com.hospital.model.FileUploadResponse;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private static final Path ROOT = Paths.get("src", "main", "resources", "files").toAbsolutePath().normalize();

    @PostMapping("/upload")
    public Result<FileUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error(400, "文件不能为空");
        }

        try {
            // 目录按日期分隔，避免同目录过大
            Path dateDir = ROOT.resolve(LocalDate.now().toString());
            Files.createDirectories(dateDir);

            String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "unknown" : file.getOriginalFilename());
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot > -1 && dot < original.length() - 1) {
                ext = original.substring(dot);
            }
            String storedName = UUID.randomUUID().toString().replace("-", "") + ext;

            Path target = dateDir.resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            FileUploadResponse resp = new FileUploadResponse();
            resp.setOriginalName(original);
            resp.setStoredName(storedName);
            resp.setContentType(file.getContentType());
            resp.setSize(file.getSize());
            resp.setRelativePath(ROOT.relativize(target).toString().replace("\\", "/"));
            return Result.success(resp);
        } catch (IOException e) {
            return Result.error(500, "保存文件失败: " + e.getMessage());
        }
    }
}
