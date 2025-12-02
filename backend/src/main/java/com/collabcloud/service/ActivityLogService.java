package com.collabcloud.service;

import com.collabcloud.entity.ActivityLogEntity;
import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.repository.ActivityLogRepository;
import com.collabcloud.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public List<ActivityLogEntity> getAllActivityLogs() {
        return activityLogRepository.findAll();
    }

    public Optional<ActivityLogEntity> getActivityLogById(Long activityId) {
        return activityLogRepository.findById(activityId);
    }

    public List<ActivityLogEntity> getActivityLogsByProjectId(Long projectId) {
        return activityLogRepository.findByProjectProjectId(projectId);
    }

    public List<ActivityLogEntity> getActivityLogsByProjectIdOrdered(Long projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        return activityLogRepository.findByProjectOrderByTimestampDesc(project);
    }

    public ActivityLogEntity createActivityLog(ActivityLogEntity activityLog) {
        // If project is provided with only ID, fetch the full entity
        if (activityLog.getProject() != null && activityLog.getProject().getProjectId() != null) {
            ProjectEntity project = projectRepository.findById(activityLog.getProject().getProjectId())
                    .orElseThrow(() -> new RuntimeException(
                            "Project not found with id: " + activityLog.getProject().getProjectId()));
            activityLog.setProject(project);
        }

        activityLog.setTimestamp(LocalDateTime.now());
        activityLog.setActionTimestamp(LocalDateTime.now());
        return activityLogRepository.save(activityLog);
    }

    public void deleteActivityLog(Long activityId) {
        ActivityLogEntity activityLog = activityLogRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("ActivityLog not found with id: " + activityId));
        activityLogRepository.delete(activityLog);
    }
}
