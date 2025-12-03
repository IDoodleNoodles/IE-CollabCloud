package com.collabcloud.controller;

import com.collabcloud.entity.ActivityLogEntity;
import com.collabcloud.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLogEntity>> getAllActivityLogs() {
        List<ActivityLogEntity> activityLogs = activityLogService.getAllActivityLogs();
        return ResponseEntity.ok(activityLogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityLogEntity> getActivityLogById(@PathVariable("id") Long activityId) {
        return activityLogService.getActivityLogById(activityId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ActivityLogEntity>> getActivityLogsByProjectId(
            @PathVariable("projectId") Long projectId) {
        List<ActivityLogEntity> activityLogs = activityLogService.getActivityLogsByProjectId(projectId);
        return ResponseEntity.ok(activityLogs);
    }

    @GetMapping("/project/{projectId}/ordered")
    public ResponseEntity<List<ActivityLogEntity>> getActivityLogsByProjectIdOrdered(
            @PathVariable("projectId") Long projectId) {
        try {
            List<ActivityLogEntity> activityLogs = activityLogService.getActivityLogsByProjectIdOrdered(projectId);
            return ResponseEntity.ok(activityLogs);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ActivityLogEntity> createActivityLog(@RequestBody ActivityLogEntity activityLog) {
        ActivityLogEntity createdActivityLog = activityLogService.createActivityLog(activityLog);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdActivityLog);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityLog(@PathVariable("id") Long activityId) {
        try {
            activityLogService.deleteActivityLog(activityId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
