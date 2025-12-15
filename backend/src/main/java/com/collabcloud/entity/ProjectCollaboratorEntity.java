package com.collabcloud.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_collaborators")
public class ProjectCollaboratorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private String permission = "edit"; // default permission

    @Column(nullable = false)
    private LocalDateTime addedAt;

    // Constructors
    public ProjectCollaboratorEntity() {
    }

    public ProjectCollaboratorEntity(ProjectEntity project, UserEntity user, String permission) {
        this.project = project;
        this.user = user;
        this.permission = permission;
        this.addedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}