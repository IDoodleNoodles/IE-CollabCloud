package com.collabcloud.controller;

import com.collabcloud.entity.FileEntity;
import com.collabcloud.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @GetMapping
    public ResponseEntity<List<FileEntity>> getAllFiles() {
        List<FileEntity> files = fileService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileEntity> getFileById(@PathVariable("id") Long fileId) {
        return fileService.getFileById(fileId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<FileEntity>> getFilesByProjectId(@PathVariable("projectId") Long projectId) {
        List<FileEntity> files = fileService.getFilesByProjectId(projectId);
        return ResponseEntity.ok(files);
    }

    @PostMapping
    public ResponseEntity<FileEntity> createFile(@RequestBody FileEntity file) {
        FileEntity createdFile = fileService.createFile(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FileEntity> updateFile(
            @PathVariable("id") Long fileId,
            @RequestBody FileEntity fileDetails) {
        try {
            FileEntity updatedFile = fileService.updateFile(fileId, fileDetails);
            return ResponseEntity.ok(updatedFile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable("id") Long fileId) {
        try {
            fileService.deleteFile(fileId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
