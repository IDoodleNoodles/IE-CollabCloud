package com.collabcloud.service;

import com.collabcloud.entity.CommentEntity;
import com.collabcloud.entity.FileEntity;
import com.collabcloud.entity.UserEntity;
import com.collabcloud.repository.CommentRepository;
import com.collabcloud.repository.FileRepository;
import com.collabcloud.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CommentEntity> getAllComments() {
        return commentRepository.findAll();
    }

    public Optional<CommentEntity> getCommentById(Long commentId) {
        return commentRepository.findById(commentId);
    }

    public List<CommentEntity> getCommentsByFileId(Long fileId) {
        return commentRepository.findByFileFileId(fileId);
    }

    public List<CommentEntity> getCommentsByUserId(Long userId) {
        return commentRepository.findByUserUserId(userId);
    }

    public CommentEntity createComment(CommentEntity comment) {
        // If user is provided with only ID, fetch the full entity
        if (comment.getUser() != null && comment.getUser().getUserId() != null) {
            UserEntity user = userRepository.findById(comment.getUser().getUserId())
                    .orElseThrow(
                            () -> new RuntimeException("User not found with id: " + comment.getUser().getUserId()));
            comment.setUser(user);
        }

        // If file is provided with only ID, fetch the full entity (file is optional)
        if (comment.getFile() != null && comment.getFile().getFileId() != null) {
            FileEntity file = fileRepository.findById(comment.getFile().getFileId())
                    .orElseThrow(
                            () -> new RuntimeException("File not found with id: " + comment.getFile().getFileId()));
            comment.setFile(file);
        } else {
            comment.setFile(null);
        }

        comment.setCreatedDate(LocalDateTime.now());
        comment.setUpdatedDate(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public CommentEntity updateComment(Long commentId, CommentEntity commentDetails) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        comment.setContent(commentDetails.getContent());
        comment.setUpdatedDate(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));
        commentRepository.delete(comment);
    }
}
