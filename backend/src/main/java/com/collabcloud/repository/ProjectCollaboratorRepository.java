package com.collabcloud.repository;

import com.collabcloud.entity.ProjectCollaboratorEntity;
import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectCollaboratorRepository extends JpaRepository<ProjectCollaboratorEntity, Long> {
    Optional<ProjectCollaboratorEntity> findByProjectAndUser(ProjectEntity project, UserEntity user);
}