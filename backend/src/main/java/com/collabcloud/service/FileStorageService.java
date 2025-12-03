package com.collabcloud.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            logger.info("File storage location initialized at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Store a multipart file and return the relative file path
     */
    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName = generateUniqueFileName(originalFileName);

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Invalid file path: " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            logger.info("File stored successfully: {}", fileName);
            return uploadDir + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }

    /**
     * Store a file from data URL (base64 encoded) and return the relative file path
     */
    public String storeFileFromDataUrl(String dataUrl, String fileName) {
        try {
            logger.info("[FileStorageService] Storing file from data URL: {}", fileName);
            logger.info("[FileStorageService] Upload directory: {}", this.fileStorageLocation.toAbsolutePath());

            // Extract base64 data from data URL
            String base64Data;
            if (dataUrl.contains(",")) {
                base64Data = dataUrl.split(",")[1];
                logger.info("[FileStorageService] Extracted base64 data (length: {})", base64Data.length());
            } else {
                base64Data = dataUrl;
                logger.warn("[FileStorageService] No comma found in data URL, using entire string");
            }

            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
            logger.info("[FileStorageService] Decoded {} bytes", decodedBytes.length);

            String uniqueFileName = generateUniqueFileName(fileName);
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            logger.info("[FileStorageService] Target file path: {}", targetLocation.toAbsolutePath());

            Files.write(targetLocation, decodedBytes);
            logger.info("✅ [FileStorageService] File written successfully to disk");

            String relativePath = uploadDir + "/" + uniqueFileName;
            logger.info("✅ [FileStorageService] Returning relative path: {}", relativePath);
            return relativePath;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file from data URL: " + fileName, ex);
        }
    }

    /**
     * Delete a file from storage
     */
    public void deleteFile(String filePath) {
        try {
            // Remove the upload directory prefix if present
            String fileName = filePath.replace(uploadDir + "/", "");
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.deleteIfExists(targetLocation);
            logger.info("File deleted: {}", fileName);
        } catch (IOException ex) {
            logger.error("Could not delete file: " + filePath, ex);
        }
    }

    /**
     * Read file content as bytes
     */
    public byte[] readFile(String filePath) {
        try {
            String fileName = filePath.replace(uploadDir + "/", "");
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            return Files.readAllBytes(targetLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not read file: " + filePath, ex);
        }
    }

    /**
     * Update file content (overwrite existing file)
     */
    public void updateFileContent(String filePath, String content) {
        try {
            String fileName = filePath.replace(uploadDir + "/", "");
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.write(targetLocation, content.getBytes());
            logger.info("File content updated: {}", fileName);
        } catch (IOException ex) {
            throw new RuntimeException("Could not update file content: " + filePath, ex);
        }
    }

    /**
     * Generate a unique file name to avoid conflicts
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = "";
        int lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFileName.substring(lastDotIndex);
        }
        return UUID.randomUUID().toString() + extension;
    }
}
