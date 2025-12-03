package com.collabcloud.controller;

import com.collabcloud.entity.VersionEntity;
import com.collabcloud.service.VersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versions")
public class VersionController {

    @Autowired
    private VersionService versionService;

    @GetMapping
    public ResponseEntity<List<VersionEntity>> getAllVersions() {
        List<VersionEntity> versions = versionService.getAllVersions();
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VersionEntity> getVersionById(@PathVariable("id") Long versionId) {
        return versionService.getVersionById(versionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/file/{fileId}")
    public ResponseEntity<List<VersionEntity>> getVersionsByFileId(@PathVariable("fileId") Long fileId) {
        List<VersionEntity> versions = versionService.getVersionsByFileId(fileId);
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/file/{fileId}/ordered")
    public ResponseEntity<List<VersionEntity>> getVersionsByFileIdOrdered(@PathVariable("fileId") Long fileId) {
        try {
            List<VersionEntity> versions = versionService.getVersionsByFileIdOrdered(fileId);
            return ResponseEntity.ok(versions);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<VersionEntity> createVersion(@RequestBody VersionEntity version) {
        VersionEntity createdVersion = versionService.createVersion(version);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVersion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VersionEntity> updateVersion(
            @PathVariable("id") Long versionId,
            @RequestBody VersionEntity versionDetails) {
        try {
            VersionEntity updatedVersion = versionService.updateVersion(versionId, versionDetails);
            return ResponseEntity.ok(updatedVersion);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVersion(@PathVariable("id") Long versionId) {
        try {
            versionService.deleteVersion(versionId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
