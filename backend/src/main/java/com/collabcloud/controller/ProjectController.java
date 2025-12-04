package com.collabcloud.controller;

import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.service.ProjectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectEntity>> getAllProjects() {
        List<ProjectEntity> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectEntity> getProjectById(@PathVariable("id") Long projectId) {
        return projectService.getProjectById(projectId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<ProjectEntity>> getProjectsByCreator(@PathVariable("userId") Long userId) {
        try {
            List<ProjectEntity> projects = projectService.getProjectsByCreator(userId);
            return ResponseEntity.ok(projects);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/collaborator/{userId}")
    public ResponseEntity<List<ProjectEntity>> getProjectsByCollaborator(@PathVariable("userId") Long userId) {
        try {
            List<ProjectEntity> projects = projectService.getProjectsByCollaborator(userId);
            return ResponseEntity.ok(projects);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectEntity project) {
        try {
            logger.debug("Creating project: {}", project.getTitle());
            ProjectEntity createdProject = projectService.createProject(project);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
        } catch (RuntimeException e) {
            logger.error("Error creating project: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("message", "Failed to create project");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectEntity> updateProject(
            @PathVariable("id") Long projectId,
            @RequestBody ProjectEntity projectDetails) {
        try {
            ProjectEntity updatedProject = projectService.updateProject(projectId, projectDetails);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable("id") Long projectId) {
        try {
            projectService.deleteProject(projectId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{projectId}/collaborators/{userId}")
    public ResponseEntity<?> addCollaborator(
            @PathVariable("projectId") Long projectId,
            @PathVariable("userId") Long userId) {
        try {
            logger.debug("Adding collaborator userId={} to projectId={}", userId, projectId);
            ProjectEntity updatedProject = projectService.addCollaborator(projectId, userId);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            logger.error("Error adding collaborator: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{projectId}/collaborators/{userId}")
    public ResponseEntity<?> removeCollaborator(
            @PathVariable("projectId") Long projectId,
            @PathVariable("userId") Long userId) {
        try {
            logger.debug("Removing collaborator userId={} from projectId={}", userId, projectId);
            ProjectEntity updatedProject = projectService.removeCollaborator(projectId, userId);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            logger.error("Error removing collaborator: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
