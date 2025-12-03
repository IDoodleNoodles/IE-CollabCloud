package com.collabcloud.repository;

import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
    List<ProjectEntity> findByCreator(UserEntity creator);

    List<ProjectEntity> findByCollaboratorsContaining(UserEntity user);
}
