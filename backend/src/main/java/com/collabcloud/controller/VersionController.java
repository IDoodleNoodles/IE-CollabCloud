package com.collabcloud.controller;

import com.collabcloud.model.Version;
import com.collabcloud.model.FileEntity;
import com.collabcloud.repository.VersionRepository;
import com.collabcloud.repository.FileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/versions")
public class VersionController {
    private final VersionRepository versionRepository;
    private final FileRepository fileRepository;

    public VersionController(VersionRepository versionRepository, FileRepository fileRepository) {
        this.versionRepository = versionRepository;
        this.fileRepository = fileRepository;
    }

    @GetMapping
    public List<Version> getAll() {
        return versionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Version> getById(@PathVariable Long id) {
        Optional<Version> v = versionRepository.findById(id);
        return v.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Version> create(@RequestBody Version payload) {
        if (payload.getFile() != null && payload.getFile().getFileID() != null) {
            fileRepository.findById(payload.getFile().getFileID()).ifPresent(payload::setFile);
        }
        Version saved = versionRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Version> update(@PathVariable Long id, @RequestBody Version payload) {
        return versionRepository.findById(id).map(existing -> {
            existing.setCommitMessage(payload.getCommitMessage());
            existing.setTimeStamp(payload.getTimeStamp());
            if (payload.getFile() != null && payload.getFile().getFileID() != null) {
                fileRepository.findById(payload.getFile().getFileID()).ifPresent(existing::setFile);
            }
            return ResponseEntity.ok(versionRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!versionRepository.existsById(id))
            return ResponseEntity.notFound().build();
        versionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
