package com.collabcloud.repository;

import com.collabcloud.entity.VersionEntity;
import com.collabcloud.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VersionRepository extends JpaRepository<VersionEntity, Long> {
    List<VersionEntity> findByFile(FileEntity file);

    List<VersionEntity> findByFileFileId(Long fileId);

    List<VersionEntity> findByFileOrderByTimestampDesc(FileEntity file);
}
