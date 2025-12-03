package com.collabcloud.service;

import com.collabcloud.entity.FileEntity;
import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.repository.FileRepository;
import com.collabcloud.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FileService {
    private static final Logger logger = LoggerFactory.getLogger(FileService.class);

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<FileEntity> getAllFiles() {
        return fileRepository.findAll();
    }

    public Optional<FileEntity> getFileById(Long fileId) {
        return fileRepository.findById(fileId);
    }

    public List<FileEntity> getFilesByProjectId(Long projectId) {
        return fileRepository.findByProjectProjectId(projectId);
    }

    public FileEntity createFile(FileEntity file) {
        logger.debug("Creating file: name={}, type={}, projectId={}", file.getFileName(), file.getFileType(),
                file.getProject() != null ? file.getProject().getProjectId() : null);
        // If project is provided with only ID, fetch the full entity
        if (file.getProject() != null && file.getProject().getProjectId() != null) {
            ProjectEntity project = projectRepository.findById(file.getProject().getProjectId())
                    .orElseThrow(() -> new RuntimeException(
                            "Project not found with id: " + file.getProject().getProjectId()));
            file.setProject(project);
        }

        file.setUploadDate(LocalDateTime.now());
        FileEntity saved = fileRepository.save(file);
        logger.info("Saved file: id={}, name={}, projectId={}", saved.getFileId(), saved.getFileName(),
                saved.getProject() != null ? saved.getProject().getProjectId() : null);
        return saved;
    }

    public FileEntity updateFile(Long fileId, FileEntity fileDetails) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));

        file.setFileName(fileDetails.getFileName());
        file.setFileType(fileDetails.getFileType());
        file.setFilePath(fileDetails.getFilePath());

        return fileRepository.save(file);
    }

    public void deleteFile(Long fileId) {
        logger.info("[FileService] Attempting to delete file with ID: {}", fileId);
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));

        logger.info("[FileService] Found file: {} with path: {}", file.getFileName(), file.getFilePath());

        // Delete the physical file if it exists
        if (file.getFilePath() != null && !file.getFilePath().startsWith("data:")) {
            try {
                logger.info("[FileService] Deleting physical file: {}", file.getFilePath());
                fileStorageService.deleteFile(file.getFilePath());
                logger.info("[FileService] ✅ Physical file deleted successfully");
            } catch (Exception e) {
                logger.warn("[FileService] ⚠️ Could not delete physical file: {}", file.getFilePath(), e);
            }
        }

        logger.info("[FileService] Deleting file entity from database");
        fileRepository.delete(file);
        logger.info("[FileService] ✅ File entity deleted from database");
    }
}
