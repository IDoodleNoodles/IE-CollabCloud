package com.collabcloud.controller;

import com.collabcloud.model.FileEntity;
import com.collabcloud.model.Project;
import com.collabcloud.repository.FileRepository;
import com.collabcloud.repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private final FileRepository fileRepository;
    private final ProjectRepository projectRepository;

    public FileController(FileRepository fileRepository, ProjectRepository projectRepository) {
        this.fileRepository = fileRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public List<FileEntity> getAll() {
        return fileRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileEntity> getById(@PathVariable Long id) {
        Optional<FileEntity> f = fileRepository.findById(id);
        return f.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FileEntity> create(@RequestBody FileEntity payload) {
        if (payload.getProject() != null && payload.getProject().getProjectID() != null) {
            projectRepository.findById(payload.getProject().getProjectID()).ifPresent(payload::setProject);
        }
        FileEntity saved = fileRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FileEntity> update(@PathVariable Long id, @RequestBody FileEntity payload) {
        return fileRepository.findById(id).map(existing -> {
            existing.setFileName(payload.getFileName());
            existing.setFileType(payload.getFileType());
            existing.setFilePath(payload.getFilePath());
            existing.setUploadedDate(payload.getUploadedDate());
            if (payload.getProject() != null && payload.getProject().getProjectID() != null) {
                projectRepository.findById(payload.getProject().getProjectID()).ifPresent(existing::setProject);
            }
            return ResponseEntity.ok(fileRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!fileRepository.existsById(id))
            return ResponseEntity.notFound().build();
        fileRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
