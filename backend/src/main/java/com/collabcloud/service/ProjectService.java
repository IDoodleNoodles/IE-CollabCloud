package com.collabcloud.service;

import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.entity.UserEntity;
import com.collabcloud.repository.ProjectRepository;
import com.collabcloud.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ProjectEntity> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<ProjectEntity> getProjectById(Long projectId) {
        return projectRepository.findById(projectId);
    }

    public List<ProjectEntity> getProjectsByCreator(Long userId) {
        UserEntity creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return projectRepository.findByCreator(creator);
    }

    public List<ProjectEntity> getProjectsByCollaborator(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return projectRepository.findByCollaboratorsContaining(user);
    }

    public ProjectEntity createProject(ProjectEntity project) {
        // Validate that creator is provided
        if (project.getCreator() == null || project.getCreator().getUserId() == null) {
            throw new RuntimeException("Creator is required to create a project");
        }

        // If creator is provided with only ID, fetch the full entity
        UserEntity creator = userRepository.findById(project.getCreator().getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Creator not found with id: " + project.getCreator().getUserId()));
        project.setCreator(creator);

        project.setCreatedDate(LocalDateTime.now());
        project.setLastModified(LocalDateTime.now());
        return projectRepository.save(project);
    }

    public ProjectEntity updateProject(Long projectId, ProjectEntity projectDetails) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        project.setTitle(projectDetails.getTitle());
        project.setDescription(projectDetails.getDescription());
        project.setLastModified(LocalDateTime.now());

        return projectRepository.save(project);
    }

    public void deleteProject(Long projectId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        projectRepository.delete(project);
    }

    public ProjectEntity addCollaborator(Long projectId, Long userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        project.getCollaborators().add(user);
        project.setLastModified(LocalDateTime.now());
        return projectRepository.save(project);
    }

    public ProjectEntity removeCollaborator(Long projectId, Long userId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        project.getCollaborators().remove(user);
        project.setLastModified(LocalDateTime.now());
        return projectRepository.save(project);
    }
}
