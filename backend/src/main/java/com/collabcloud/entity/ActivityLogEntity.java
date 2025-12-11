package com.collabcloud.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long activityId;

    @Column(nullable = false)
    private String actionType;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String data;

    @Column(nullable = false)
    private String actionDescription;

    @Column(nullable = false)
    private LocalDateTime actionTimestamp;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = true)
    private ProjectEntity project;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnoreProperties({"createdProjects", "collaboratingProjects", "comments", "password", "bio", "profilePicture", "lastLogin"})
    private UserEntity user;

    // Constructors
    public ActivityLogEntity() {
    }

    public ActivityLogEntity(String actionType, String data, String actionDescription, ProjectEntity project) {
        this.actionType = actionType;
        this.data = data;
        this.actionDescription = actionDescription;
        this.project = project;
        this.timestamp = LocalDateTime.now();
        this.actionTimestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getActivityId() {
        return activityId;
    }

    public void setActivityId(Long activityId) {
        this.activityId = activityId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getActionDescription() {
        return actionDescription;
    }

    public void setActionDescription(String actionDescription) {
        this.actionDescription = actionDescription;
    }

    public LocalDateTime getActionTimestamp() {
        return actionTimestamp;
    }

    public void setActionTimestamp(LocalDateTime actionTimestamp) {
        this.actionTimestamp = actionTimestamp;
    }

    public ProjectEntity getProject() {
        return project;
    }

    public void setProject(ProjectEntity project) {
        this.project = project;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }
}
