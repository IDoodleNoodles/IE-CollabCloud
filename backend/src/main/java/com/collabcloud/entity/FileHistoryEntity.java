package com.collabcloud.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_history")
public class FileHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private FileEntity file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity modifiedBy;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime modifiedDate;

    @Column(length = 100)
    private String changeDescription;

    @Column(length = 50)
    private String changeType; // CREATE, UPDATE, RESTORE, DELETE

    @Column(name = "version_reference")
    private Long versionReference; // Reference to VersionEntity if this was a restore

    @Column(length = 500)
    private String filePath; // Store the file path at the time of change

    // Constructors
    public FileHistoryEntity() {
    }

    public FileHistoryEntity(FileEntity file, UserEntity modifiedBy, String content, String changeType, String changeDescription) {
        this.file = file;
        this.modifiedBy = modifiedBy;
        this.content = content;
        this.changeType = changeType;
        this.changeDescription = changeDescription;
        this.modifiedDate = LocalDateTime.now();
        this.filePath = file.getFilePath();
    }

    // Getters and Setters
    public Long getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }

    public FileEntity getFile() {
        return file;
    }

    public void setFile(FileEntity file) {
        this.file = file;
    }

    public UserEntity getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(UserEntity modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(LocalDateTime modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public String getChangeDescription() {
        return changeDescription;
    }

    public void setChangeDescription(String changeDescription) {
        this.changeDescription = changeDescription;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public Long getVersionReference() {
        return versionReference;
    }

    public void setVersionReference(Long versionReference) {
        this.versionReference = versionReference;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}
