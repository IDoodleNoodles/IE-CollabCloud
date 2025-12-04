package com.collabcloud.controller;

import com.collabcloud.entity.CommentEntity;
import com.collabcloud.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentEntity>> getAllComments() {
        List<CommentEntity> comments = commentService.getAllComments();
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentEntity> getCommentById(@PathVariable("id") Long commentId) {
        return commentService.getCommentById(commentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/file/{fileId}")
    public ResponseEntity<List<CommentEntity>> getCommentsByFileId(@PathVariable("fileId") Long fileId) {
        List<CommentEntity> comments = commentService.getCommentsByFileId(fileId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CommentEntity>> getCommentsByUserId(@PathVariable("userId") Long userId) {
        List<CommentEntity> comments = commentService.getCommentsByUserId(userId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody CommentEntity comment) {
        try {
            CommentEntity createdComment = commentService.createComment(comment);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentEntity> updateComment(
            @PathVariable("id") Long commentId,
            @RequestBody CommentEntity commentDetails) {
        try {
            CommentEntity updatedComment = commentService.updateComment(commentId, commentDetails);
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable("id") Long commentId) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
