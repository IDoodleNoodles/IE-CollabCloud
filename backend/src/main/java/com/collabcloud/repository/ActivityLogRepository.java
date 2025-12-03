package com.collabcloud.repository;

import com.collabcloud.entity.ActivityLogEntity;
import com.collabcloud.entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long> {
    List<ActivityLogEntity> findByProject(ProjectEntity project);

    List<ActivityLogEntity> findByProjectProjectId(Long projectId);

    List<ActivityLogEntity> findByProjectOrderByTimestampDesc(ProjectEntity project);
}
