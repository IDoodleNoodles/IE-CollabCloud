package com.collabcloud.controller;

import com.collabcloud.entity.FileEntity;
import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.entity.UserEntity;
import com.collabcloud.service.FileService;
import com.collabcloud.service.FileStorageService;
import com.collabcloud.service.FileHistoryService;
import com.collabcloud.service.UserService;
import com.collabcloud.repository.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private FileService fileService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private FileHistoryService fileHistoryService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<FileEntity>> getAllFiles() {
        List<FileEntity> files = fileService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileEntity> getFileById(@PathVariable("id") Long fileId) {
        return fileService.getFileById(fileId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<FileEntity>> getFilesByProjectId(@PathVariable("projectId") Long projectId) {
        List<FileEntity> files = fileService.getFilesByProjectId(projectId);
        return ResponseEntity.ok(files);
    }

    /**
     * Upload file with multipart form data
     */
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<FileEntity> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") Long projectId) {
        try {
            logger.debug("Uploading file: name={}, size={}, projectId={}",
                    file.getOriginalFilename(), file.getSize(), projectId);

            // Store file on disk
            String filePath = fileStorageService.storeFile(file);

            // Get project
            ProjectEntity project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

            // Create file entity
            FileEntity fileEntity = new FileEntity();
            fileEntity.setFileName(file.getOriginalFilename());
            fileEntity.setFileType(file.getContentType());
            fileEntity.setFilePath(filePath);
            fileEntity.setProject(project);
            fileEntity.setUploadDate(LocalDateTime.now());

            FileEntity savedFile = fileService.createFile(fileEntity);
            logger.info("File uploaded: id={}, name={}, path={}",
                    savedFile.getFileId(), savedFile.getFileName(), savedFile.getFilePath());

            return ResponseEntity.status(HttpStatus.CREATED).body(savedFile);
        } catch (Exception e) {
            logger.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create file from JSON payload (supports data URLs)
     */
    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<FileEntity> createFile(@RequestBody Map<String, Object> payload) {
        try {
            logger.info("=== POST /api/files - Received file upload request ===");
            logger.info("Full payload: {}", payload);

            String fileName = (String) payload.get("fileName");
            String fileType = (String) payload.get("fileType");
            String dataUrl = (String) payload.get("filePath");
            Long projectId = payload.get("projectId") != null ? ((Number) payload.get("projectId")).longValue() : null;

            logger.info("Extracted - fileName: {}, fileType: {}, projectId: {}, dataUrl length: {}",
                    fileName, fileType, projectId, dataUrl != null ? dataUrl.length() : 0);

            if (projectId == null && payload.get("project") instanceof Map) {
                logger.info("ProjectId is null, checking nested project object");
                Map<String, Object> projectMap = (Map<String, Object>) payload.get("project");
                projectId = projectMap.get("projectId") != null ? ((Number) projectMap.get("projectId")).longValue()
                        : null;
                logger.info("Extracted projectId from nested object: {}", projectId);
            }

            if (fileName == null || projectId == null) {
                logger.error("Validation failed - fileName: {}, projectId: {}", fileName, projectId);
                return ResponseEntity.badRequest().build();
            }

            logger.info("Validation passed - proceeding with file storage");

            final Long finalProjectId = projectId;

            // Get project
            logger.info("Looking up project with ID: {}", finalProjectId);
            ProjectEntity project = projectRepository.findById(finalProjectId)
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + finalProjectId));
            logger.info("Found project: id={}, title={}", project.getProjectId(), project.getTitle());

            String filePath;
            // Check if it's a data URL
            if (dataUrl != null && dataUrl.startsWith("data:")) {
                logger.info("Data URL detected, storing file to disk...");
                // Store file from data URL
                filePath = fileStorageService.storeFileFromDataUrl(dataUrl, fileName);
                logger.info("✅ File stored successfully from data URL to: {}", filePath);
            } else {
                logger.warn("Not a data URL, using provided path: {}", dataUrl);
                // Use the provided path (for backward compatibility)
                filePath = dataUrl;
            }

            // Create file entity
            logger.info("Creating file entity with path: {}", filePath);
            FileEntity fileEntity = new FileEntity();
            fileEntity.setFileName(fileName);
            fileEntity.setFileType(fileType);
            fileEntity.setFilePath(filePath);
            fileEntity.setProject(project);
            fileEntity.setUploadDate(LocalDateTime.now());

            logger.info("Saving file entity to database...");
            FileEntity savedFile = fileService.createFile(fileEntity);
            logger.info("✅ File successfully created in database:");
            logger.info("   - File ID: {}", savedFile.getFileId());
            logger.info("   - File Name: {}", savedFile.getFileName());
            logger.info("   - File Path: {}", savedFile.getFilePath());
            logger.info("   - Project ID: {}", savedFile.getProject().getProjectId());
            logger.info("=== File upload completed successfully ===");

            return ResponseEntity.status(HttpStatus.CREATED).body(savedFile);
        } catch (Exception e) {
            logger.error("❌ Error creating file - Exception type: {}", e.getClass().getName());
            logger.error("❌ Error message: {}", e.getMessage());
            logger.error("❌ Full stack trace:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FileEntity> updateFile(
            @PathVariable("id") Long fileId,
            @RequestBody FileEntity fileDetails) {
        try {
            FileEntity updatedFile = fileService.updateFile(fileId, fileDetails);
            return ResponseEntity.ok(updatedFile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/content")
    public ResponseEntity<FileEntity> updateFileContent(
            @PathVariable("id") Long fileId,
            @RequestBody java.util.Map<String, String> payload) {
        try {
            String content = payload.get("content");
            String userIdStr = payload.get("userId");
            if (content == null) {
                return ResponseEntity.badRequest().build();
            }
            
            FileEntity file = fileService.getFileById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));
            
            // Track the change in history before updating
            UserEntity user = null;
            if (userIdStr != null) {
                try {
                    Long userId = Long.parseLong(userIdStr);
                    user = userService.getUserById(userId).orElse(null);
                } catch (NumberFormatException e) {
                    logger.warn("Invalid userId format: {}", userIdStr);
                }
            }
            
            fileHistoryService.createHistoryEntry(file, user, content, "UPDATE", "File content updated");
            fileStorageService.updateFileContent(file.getFilePath(), content);
            
            return ResponseEntity.ok(file);
        } catch (RuntimeException e) {
            logger.error("Error updating file content: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable("id") Long fileId) {
        logger.info("[FileController] ❌ DELETE request for file ID: {}", fileId);
        try {
            fileService.deleteFile(fileId);
            logger.info("[FileController] ✅ File {} deleted successfully", fileId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("[FileController] ❌ Error deleting file {}: {}", fileId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Upload multiple files from data URLs (for backward compatibility with
     * frontend)
     */
    @PostMapping("/batch")
    public ResponseEntity<List<FileEntity>> uploadMultipleFiles(@RequestBody List<Map<String, Object>> filesPayload) {
        try {
            logger.info("=== POST /api/files/batch - Batch upload request ===");
            logger.info("Number of files in batch: {}", filesPayload.size());
            List<FileEntity> savedFiles = new ArrayList<>();

            for (Map<String, Object> fileData : filesPayload) {
                logger.info("Processing file #{} in batch", savedFiles.size() + 1);
                String fileName = (String) fileData.get("fileName");
                String fileType = (String) fileData.get("fileType");
                String dataUrl = (String) fileData.get("filePath");
                Long projectId = fileData.get("projectId") != null ? ((Number) fileData.get("projectId")).longValue()
                        : null;
                logger.info("Batch file - name: {}, type: {}, projectId: {}", fileName, fileType, projectId);

                if (projectId == null && fileData.get("project") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> projectMap = (Map<String, Object>) fileData.get("project");
                    projectId = projectMap.get("projectId") != null ? ((Number) projectMap.get("projectId")).longValue()
                            : null;
                }

                if (fileName == null || projectId == null) {
                    continue; // Skip invalid entries
                }

                final Long finalProjectId = projectId;
                ProjectEntity project = projectRepository.findById(finalProjectId)
                        .orElseThrow(() -> new RuntimeException("Project not found with id: " + finalProjectId));

                String filePath;
                if (dataUrl != null && dataUrl.startsWith("data:")) {
                    filePath = fileStorageService.storeFileFromDataUrl(dataUrl, fileName);
                    logger.info("File stored from data URL: {}", filePath);
                } else {
                    filePath = dataUrl;
                }

                FileEntity fileEntity = new FileEntity();
                fileEntity.setFileName(fileName);
                fileEntity.setFileType(fileType);
                fileEntity.setFilePath(filePath);
                fileEntity.setProject(project);
                fileEntity.setUploadDate(LocalDateTime.now());

                FileEntity savedFile = fileService.createFile(fileEntity);
                savedFiles.add(savedFile);
            }

            logger.info("Batch uploaded {} files", savedFiles.size());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedFiles);
        } catch (Exception e) {
            logger.error("Error in batch upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Download file content
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable("id") Long fileId) {
        try {
            FileEntity file = fileService.getFileById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));

            if (file.getFilePath().startsWith("data:")) {
                // Return data URL as-is for backward compatibility
                return ResponseEntity.ok()
                        .header("Content-Type", file.getFileType())
                        .header("Content-Disposition", "attachment; filename=\"" + file.getFileName() + "\"")
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .header("Pragma", "no-cache")
                        .header("Expires", "0")
                        .body(file.getFilePath().getBytes());
            } else {
                // Read file from disk
                byte[] fileContent = fileStorageService.readFile(file.getFilePath());
                return ResponseEntity.ok()
                        .header("Content-Type", file.getFileType())
                        .header("Content-Disposition", "attachment; filename=\"" + file.getFileName() + "\"")
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .header("Pragma", "no-cache")
                        .header("Expires", "0")
                        .body(fileContent);
            }
        } catch (Exception e) {
            logger.error("Error downloading file", e);
            return ResponseEntity.notFound().build();
        }
    }
}
