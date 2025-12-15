package com.collabcloud.repository;

import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
    List<ProjectEntity> findByCreator(UserEntity creator);

    @Query("SELECT p FROM ProjectEntity p JOIN p.collaborators c WHERE c.user = :user")
    List<ProjectEntity> findByCollaboratorsContaining(@Param("user") UserEntity user);
}
