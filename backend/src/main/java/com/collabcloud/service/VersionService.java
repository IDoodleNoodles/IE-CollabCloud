package com.collabcloud.service;

import com.collabcloud.entity.VersionEntity;
import com.collabcloud.entity.FileEntity;
import com.collabcloud.repository.VersionRepository;
import com.collabcloud.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VersionService {

    @Autowired
    private VersionRepository versionRepository;

    @Autowired
    private FileRepository fileRepository;

    public List<VersionEntity> getAllVersions() {
        return versionRepository.findAll();
    }

    public Optional<VersionEntity> getVersionById(Long versionId) {
        return versionRepository.findById(versionId);
    }

    public List<VersionEntity> getVersionsByFileId(Long fileId) {
        return versionRepository.findByFileFileId(fileId);
    }

    public List<VersionEntity> getVersionsByFileIdOrdered(Long fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));
        return versionRepository.findByFileOrderByTimestampDesc(file);
    }

    public VersionEntity createVersion(VersionEntity version) {
        // If file is provided with only ID, fetch the full entity
        if (version.getFile() != null && version.getFile().getFileId() != null) {
            FileEntity file = fileRepository.findById(version.getFile().getFileId())
                    .orElseThrow(
                            () -> new RuntimeException("File not found with id: " + version.getFile().getFileId()));
            version.setFile(file);
        }

        version.setTimestamp(LocalDateTime.now());
        return versionRepository.save(version);
    }

    public VersionEntity updateVersion(Long versionId, VersionEntity versionDetails) {
        VersionEntity version = versionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found with id: " + versionId));

        version.setVersionMessage(versionDetails.getVersionMessage());
        version.setVersionNumber(versionDetails.getVersionNumber());
        version.setContent(versionDetails.getContent());

        return versionRepository.save(version);
    }

    public void deleteVersion(Long versionId) {
        VersionEntity version = versionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found with id: " + versionId));
        versionRepository.delete(version);
    }
}
