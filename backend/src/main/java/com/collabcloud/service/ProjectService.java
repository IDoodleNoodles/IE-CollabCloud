package com.collabcloud.service;

import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.entity.ProjectCollaboratorEntity;
import com.collabcloud.entity.UserEntity;
import com.collabcloud.repository.ProjectRepository;
import com.collabcloud.repository.ProjectCollaboratorRepository;
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
    private ProjectCollaboratorRepository projectCollaboratorRepository;

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

    public ProjectEntity addCollaborator(Long projectId, Long userId, Long ownerId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        if (!project.getCreator().getUserId().equals(ownerId)) {
            throw new RuntimeException("Only the project owner can add collaborators.");
        }
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if already a collaborator
        Optional<ProjectCollaboratorEntity> existing = projectCollaboratorRepository.findByProjectAndUser(project,
                user);
        if (existing.isPresent()) {
            throw new RuntimeException("User is already a collaborator on this project.");
        }

        ProjectCollaboratorEntity collaborator = new ProjectCollaboratorEntity(project, user, "edit");
        project.getCollaborators().add(collaborator);
        project.setLastModified(LocalDateTime.now());
        return projectRepository.save(project);
    }

    public ProjectEntity removeCollaborator(Long projectId, Long userId, Long ownerId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        if (!project.getCreator().getUserId().equals(ownerId)) {
            throw new RuntimeException("Only the project owner can remove collaborators.");
        }
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ProjectCollaboratorEntity collaborator = projectCollaboratorRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new RuntimeException("User is not a collaborator on this project."));

        project.getCollaborators().remove(collaborator);
        projectCollaboratorRepository.delete(collaborator);
        project.setLastModified(LocalDateTime.now());
        return projectRepository.save(project);
    }

    public ProjectEntity updateCollaboratorPermission(Long projectId, Long userId, String permission, Long ownerId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        if (!project.getCreator().getUserId().equals(ownerId)) {
            throw new RuntimeException("Only the project owner can update collaborator permissions.");
        }
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ProjectCollaboratorEntity collaborator = projectCollaboratorRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new RuntimeException("User is not a collaborator on this project."));

        collaborator.setPermission(permission);
        projectCollaboratorRepository.save(collaborator);
        project.setLastModified(LocalDateTime.now());
        return projectRepository.save(project);
    }
}
