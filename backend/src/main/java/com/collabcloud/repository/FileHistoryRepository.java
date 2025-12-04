package com.collabcloud.repository;

import com.collabcloud.entity.FileHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileHistoryRepository extends JpaRepository<FileHistoryEntity, Long> {
    
    @Query("SELECT fh FROM FileHistoryEntity fh WHERE fh.file.fileId = :fileId ORDER BY fh.modifiedDate DESC")
    List<FileHistoryEntity> findByFileIdOrderByModifiedDateDesc(@Param("fileId") Long fileId);
    
    @Query("SELECT fh FROM FileHistoryEntity fh WHERE fh.file.project.projectId = :projectId ORDER BY fh.modifiedDate DESC")
    List<FileHistoryEntity> findByProjectIdOrderByModifiedDateDesc(@Param("projectId") Long projectId);
    
    @Query("SELECT fh FROM FileHistoryEntity fh WHERE fh.modifiedBy.userId = :userId ORDER BY fh.modifiedDate DESC")
    List<FileHistoryEntity> findByUserIdOrderByModifiedDateDesc(@Param("userId") Long userId);
}
