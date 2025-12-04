package com.collabcloud.service;

import com.collabcloud.entity.FileEntity;
import com.collabcloud.entity.FileHistoryEntity;
import com.collabcloud.entity.UserEntity;
import com.collabcloud.repository.FileHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FileHistoryService {

    @Autowired
    private FileHistoryRepository fileHistoryRepository;

    @Transactional
    public FileHistoryEntity createHistoryEntry(FileEntity file, UserEntity user, String content, String changeType, String description) {
        FileHistoryEntity history = new FileHistoryEntity(file, user, content, changeType, description);
        return fileHistoryRepository.save(history);
    }

    @Transactional
    public FileHistoryEntity createRestoreHistoryEntry(FileEntity file, UserEntity user, String content, Long versionReference) {
        FileHistoryEntity history = new FileHistoryEntity(file, user, content, "RESTORE", "Restored from version " + versionReference);
        history.setVersionReference(versionReference);
        return fileHistoryRepository.save(history);
    }

    public List<FileHistoryEntity> getFileHistory(Long fileId) {
        return fileHistoryRepository.findByFileIdOrderByModifiedDateDesc(fileId);
    }

    public List<FileHistoryEntity> getProjectHistory(Long projectId) {
        return fileHistoryRepository.findByProjectIdOrderByModifiedDateDesc(projectId);
    }

    public List<FileHistoryEntity> getUserHistory(Long userId) {
        return fileHistoryRepository.findByUserIdOrderByModifiedDateDesc(userId);
    }

    public Optional<FileHistoryEntity> getHistoryById(Long historyId) {
        return fileHistoryRepository.findById(historyId);
    }

    @Transactional
    public void deleteHistoryEntry(Long historyId) {
        fileHistoryRepository.deleteById(historyId);
    }
}
