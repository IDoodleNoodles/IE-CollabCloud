package com.collabcloud.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import javax.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)  // Hide password from responses
    private String password;

    @Column(nullable = false)
    private String role;

    private String bio;

    private String profilePicture;

    private LocalDate lastLogin;

    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<ProjectEntity> createdProjects = new HashSet<>();

    @ManyToMany(mappedBy = "collaborators")
    @JsonIgnore
    private Set<ProjectEntity> collaboratingProjects = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<CommentEntity> comments = new HashSet<>();

    // Constructors
    public UserEntity() {
    }

    public UserEntity(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public LocalDate getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDate lastLogin) {
        this.lastLogin = lastLogin;
    }

    public Set<ProjectEntity> getCreatedProjects() {
        return createdProjects;
    }

    public void setCreatedProjects(Set<ProjectEntity> createdProjects) {
        this.createdProjects = createdProjects;
    }

    public Set<ProjectEntity> getCollaboratingProjects() {
        return collaboratingProjects;
    }

    public void setCollaboratingProjects(Set<ProjectEntity> collaboratingProjects) {
        this.collaboratingProjects = collaboratingProjects;
    }

    public Set<CommentEntity> getComments() {
        return comments;
    }

    public void setComments(Set<CommentEntity> comments) {
        this.comments = comments;
    }
}
