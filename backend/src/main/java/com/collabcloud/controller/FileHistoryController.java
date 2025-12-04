package com.collabcloud.controller;

import com.collabcloud.entity.FileHistoryEntity;
import com.collabcloud.service.FileHistoryService;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/file-history")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FileHistoryController {

    @Autowired
    private FileHistoryService fileHistoryService;

    // DTO to avoid circular references
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FileHistoryDTO {
        private Long historyId;
        private Long fileId;
        private String fileName;
        private Long userId;
        private String userName;
        private String userEmail;
        private String content;
        private LocalDateTime modifiedDate;
        private String changeDescription;
        private String changeType;
        private Long versionReference;
        private String filePath;

        public FileHistoryDTO(FileHistoryEntity entity) {
            this.historyId = entity.getHistoryId();
            this.fileId = entity.getFile() != null ? entity.getFile().getFileId() : null;
            this.fileName = entity.getFile() != null ? entity.getFile().getFileName() : null;
            this.userId = entity.getModifiedBy() != null ? entity.getModifiedBy().getUserId() : null;
            this.userName = entity.getModifiedBy() != null ? entity.getModifiedBy().getName() : null;
            this.userEmail = entity.getModifiedBy() != null ? entity.getModifiedBy().getEmail() : null;
            this.content = entity.getContent();
            this.modifiedDate = entity.getModifiedDate();
            this.changeDescription = entity.getChangeDescription();
            this.changeType = entity.getChangeType();
            this.versionReference = entity.getVersionReference();
            this.filePath = entity.getFilePath();
        }

        // Getters and setters
        public Long getHistoryId() { return historyId; }
        public void setHistoryId(Long historyId) { this.historyId = historyId; }
        public Long getFileId() { return fileId; }
        public void setFileId(Long fileId) { this.fileId = fileId; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public LocalDateTime getModifiedDate() { return modifiedDate; }
        public void setModifiedDate(LocalDateTime modifiedDate) { this.modifiedDate = modifiedDate; }
        public String getChangeDescription() { return changeDescription; }
        public void setChangeDescription(String changeDescription) { this.changeDescription = changeDescription; }
        public String getChangeType() { return changeType; }
        public void setChangeType(String changeType) { this.changeType = changeType; }
        public Long getVersionReference() { return versionReference; }
        public void setVersionReference(Long versionReference) { this.versionReference = versionReference; }
        public String getFilePath() { return filePath; }
        public void setFilePath(String filePath) { this.filePath = filePath; }
    }

    @GetMapping("/file/{fileId}")
    public ResponseEntity<List<FileHistoryDTO>> getFileHistory(@PathVariable Long fileId) {
        List<FileHistoryEntity> history = fileHistoryService.getFileHistory(fileId);
        List<FileHistoryDTO> dtos = history.stream()
                .map(FileHistoryDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<FileHistoryDTO>> getProjectHistory(@PathVariable Long projectId) {
        List<FileHistoryEntity> history = fileHistoryService.getProjectHistory(projectId);
        List<FileHistoryDTO> dtos = history.stream()
                .map(FileHistoryDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FileHistoryDTO>> getUserHistory(@PathVariable Long userId) {
        List<FileHistoryEntity> history = fileHistoryService.getUserHistory(userId);
        List<FileHistoryDTO> dtos = history.stream()
                .map(FileHistoryDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{historyId}")
    public ResponseEntity<FileHistoryDTO> getHistoryById(@PathVariable Long historyId) {
        return fileHistoryService.getHistoryById(historyId)
                .map(entity -> ResponseEntity.ok(new FileHistoryDTO(entity)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{historyId}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long historyId) {
        fileHistoryService.deleteHistoryEntry(historyId);
        return ResponseEntity.noContent().build();
    }
}
