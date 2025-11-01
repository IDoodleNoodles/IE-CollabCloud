package com.collabcloud.controller;

import com.collabcloud.model.Comment;
import com.collabcloud.model.FileEntity;
import com.collabcloud.repository.CommentRepository;
import com.collabcloud.repository.FileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentRepository commentRepository;
    private final FileRepository fileRepository;

    public CommentController(CommentRepository commentRepository, FileRepository fileRepository) {
        this.commentRepository = commentRepository;
        this.fileRepository = fileRepository;
    }

    @GetMapping
    public List<Comment> getAll() {
        return commentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getById(@PathVariable Long id) {
        Optional<Comment> c = commentRepository.findById(id);
        return c.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Comment> create(@RequestBody Comment payload) {
        if (payload.getFile() != null && payload.getFile().getFileID() != null) {
            fileRepository.findById(payload.getFile().getFileID()).ifPresent(payload::setFile);
        }
        Comment saved = commentRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> update(@PathVariable Long id, @RequestBody Comment payload) {
        return commentRepository.findById(id).map(existing -> {
            existing.setContent(payload.getContent());
            existing.setEmail(payload.getEmail());
            existing.setCreatedDate(payload.getCreatedDate());
            if (payload.getFile() != null && payload.getFile().getFileID() != null) {
                fileRepository.findById(payload.getFile().getFileID()).ifPresent(existing::setFile);
            }
            return ResponseEntity.ok(commentRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!commentRepository.existsById(id))
            return ResponseEntity.notFound().build();
        commentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
