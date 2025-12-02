package com.collabcloud.repository;

import com.collabcloud.entity.FileEntity;
import com.collabcloud.entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByProject(ProjectEntity project);

    List<FileEntity> findByProjectProjectId(Long projectId);
}
