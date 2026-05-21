package com.equisoft.leavemanagement.controller;

import com.equisoft.leavemanagement.service.FileStorageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService storage;

    public FileController(FileStorageService storage) {
        this.storage = storage;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        return Map.of("url", storage.upload(file));
    }
}
