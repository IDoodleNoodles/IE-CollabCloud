package com.collabcloud.repository;

import com.collabcloud.entity.CommentEntity;
import com.collabcloud.entity.FileEntity;
import com.collabcloud.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByFile(FileEntity file);

    List<CommentEntity> findByFileFileId(Long fileId);

    List<CommentEntity> findByUser(UserEntity user);

    List<CommentEntity> findByUserUserId(Long userId);
}
