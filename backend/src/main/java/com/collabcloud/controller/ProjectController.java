package com.collabcloud.controller;

import com.collabcloud.model.Project;
import com.collabcloud.model.User;
import com.collabcloud.repository.ProjectRepository;
import com.collabcloud.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable Long id) {
        Optional<Project> p = projectRepository.findById(id);
        return p.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> create(@RequestBody Project payload) {
        // If payload contains owner with ID, fetch and attach
        if (payload.getOwner() != null && payload.getOwner().getUserID() != null) {
            Optional<User> owner = userRepository.findById(payload.getOwner().getUserID());
            owner.ifPresent(payload::setOwner);
        }
        Project saved = projectRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable Long id, @RequestBody Project payload) {
        return projectRepository.findById(id).map(existing -> {
            existing.setProjectName(payload.getProjectName());
            existing.setDescription(payload.getDescription());
            existing.setCreatedDate(payload.getCreatedDate());
            // owner handling
            if (payload.getOwner() != null && payload.getOwner().getUserID() != null) {
                userRepository.findById(payload.getOwner().getUserID()).ifPresent(existing::setOwner);
            }
            return ResponseEntity.ok(projectRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!projectRepository.existsById(id))
            return ResponseEntity.notFound().build();
        projectRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
