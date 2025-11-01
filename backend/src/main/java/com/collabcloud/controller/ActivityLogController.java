package com.collabcloud.controller;

import com.collabcloud.model.ActivityLog;
import com.collabcloud.model.Project;
import com.collabcloud.repository.ActivityLogRepository;
import com.collabcloud.repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/activitylogs")
public class ActivityLogController {
    private final ActivityLogRepository activityLogRepository;
    private final ProjectRepository projectRepository;

    public ActivityLogController(ActivityLogRepository activityLogRepository, ProjectRepository projectRepository) {
        this.activityLogRepository = activityLogRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public List<ActivityLog> getAll() {
        return activityLogRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityLog> getById(@PathVariable Long id) {
        Optional<ActivityLog> a = activityLogRepository.findById(id);
        return a.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ActivityLog> create(@RequestBody ActivityLog payload) {
        if (payload.getProject() != null && payload.getProject().getProjectID() != null) {
            projectRepository.findById(payload.getProject().getProjectID()).ifPresent(payload::setProject);
        }
        ActivityLog saved = activityLogRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityLog> update(@PathVariable Long id, @RequestBody ActivityLog payload) {
        return activityLogRepository.findById(id).map(existing -> {
            existing.setActionType(payload.getActionType());
            existing.setTimeStamp(payload.getTimeStamp());
            if (payload.getProject() != null && payload.getProject().getProjectID() != null) {
                projectRepository.findById(payload.getProject().getProjectID()).ifPresent(existing::setProject);
            }
            return ResponseEntity.ok(activityLogRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!activityLogRepository.existsById(id))
            return ResponseEntity.notFound().build();
        activityLogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
