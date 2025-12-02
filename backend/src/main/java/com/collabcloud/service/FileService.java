package com.collabcloud.service;

import com.collabcloud.entity.FileEntity;
import com.collabcloud.entity.ProjectEntity;
import com.collabcloud.repository.FileRepository;
import com.collabcloud.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private ProjectRepository projectRepository;

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
        // If project is provided with only ID, fetch the full entity
        if (file.getProject() != null && file.getProject().getProjectId() != null) {
            ProjectEntity project = projectRepository.findById(file.getProject().getProjectId())
                    .orElseThrow(() -> new RuntimeException(
                            "Project not found with id: " + file.getProject().getProjectId()));
            file.setProject(project);
        }

        file.setUploadDate(LocalDateTime.now());
        return fileRepository.save(file);
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
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));
        fileRepository.delete(file);
    }
}
