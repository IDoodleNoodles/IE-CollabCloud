package com.collabcloud.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Store a multipart file and return the relative file path
     */
    public String storeFile(MultipartFile file) {
        String rawOriginalFileName = file.getOriginalFilename();
        String originalFileName = "file";
        if (rawOriginalFileName != null && !rawOriginalFileName.isBlank()) {
            originalFileName = StringUtils.cleanPath(rawOriginalFileName);
        }
        String fileName = generateUniqueFileName(originalFileName);

        try {
            byte[] bytes = file.getBytes();
            uploadBytes(fileName, bytes);
            logger.info("File stored successfully in Supabase: {}", fileName);
            return getStoredFilePath(fileName);
        } catch (Exception ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }

    /**
     * Store a file from data URL (base64 encoded) and return the relative file path
     */
    public String storeFileFromDataUrl(String dataUrl, String fileName) {
        try {
            logger.info("[FileStorageService] Storing file from data URL in Supabase: {}", fileName);

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
            uploadBytes(uniqueFileName, decodedBytes);

            String relativePath = getStoredFilePath(uniqueFileName);
            logger.info("✅ [FileStorageService] Returning relative path: {}", relativePath);
            return relativePath;
        } catch (Exception ex) {
            throw new RuntimeException("Could not store file from data URL: " + fileName, ex);
        }
    }

    /**
     * Delete a file from storage
     */
    public void deleteFile(String filePath) {
        try {
            String objectPath = extractObjectPath(filePath);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(buildObjectDeleteUrl()))
                    .header("Authorization", "Bearer " + serviceKey)
                    .header("Content-Type", "application/json")
                    .method("DELETE", HttpRequest.BodyPublishers.ofString("{\"prefixes\":[\"" + escapeJson(objectPath) + "\"]}"))
                    .build();

            HttpResponse<String> response = sendStringRequest(request);
            if (!isSuccess(response.statusCode())) {
                throw new RuntimeException("Supabase delete failed with status " + response.statusCode() + ": " + response.body());
            }
            logger.info("File deleted from Supabase: {}", objectPath);
        } catch (Exception ex) {
            logger.error("Could not delete file: " + filePath, ex);
            throw new RuntimeException("Could not delete file: " + filePath, ex);
        }
    }

    /**
     * Read file content as bytes
     */
    public byte[] readFile(String filePath) {
        try {
            if (filePath != null && filePath.startsWith("data:")) {
                int commaIndex = filePath.indexOf(',');
                String base64 = commaIndex >= 0 ? filePath.substring(commaIndex + 1) : filePath;
                byte[] bytes = Base64.getDecoder().decode(base64);
                ByteArrayResource resource = new ByteArrayResource(bytes != null ? bytes : new byte[0]);
                return resource.getByteArray();
            }

                String objectPath = extractObjectPath(filePath);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(buildObjectReadUrl(objectPath)))
                    .header("Authorization", "Bearer " + serviceKey)
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (!isSuccess(response.statusCode())) {
                String errorBody = new String(response.body(), StandardCharsets.UTF_8);
                throw new RuntimeException("Supabase read failed with status " + response.statusCode() + ": " + errorBody);
            }

            byte[] bytes = response.body();
            ByteArrayResource resource = new ByteArrayResource(bytes != null ? bytes : new byte[0]);
            return resource.getByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Could not read file: " + filePath, ex);
        }
    }

    /**
     * Update file content (overwrite existing file)
     */
    public void updateFileContent(String filePath, String content) {
        try {
            if (filePath != null && filePath.startsWith("data:")) {
                logger.info("Skipping Supabase update for inline data URL: {}", filePath);
                return;
            }

            String objectPath = extractObjectPath(filePath);
            uploadBytes(objectPath, content.getBytes(StandardCharsets.UTF_8));
            logger.info("File content updated in Supabase: {}", objectPath);
        } catch (Exception ex) {
            throw new RuntimeException("Could not update file content: " + filePath, ex);
        }
    }

    private void uploadBytes(String fileName, byte[] bytes) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(buildObjectUploadUrl(fileName)))
                .header("Authorization", "Bearer " + serviceKey)
                .header("Content-Type", "application/octet-stream")
                .header("x-upsert", "true")
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();

        HttpResponse<String> response = sendStringRequest(request);
        if (!isSuccess(response.statusCode())) {
            throw new RuntimeException("Supabase upload failed with status " + response.statusCode() + ": " + response.body());
        }
    }

    private HttpResponse<String> sendStringRequest(HttpRequest request) throws IOException, InterruptedException {
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private boolean isSuccess(int statusCode) {
        return statusCode >= 200 && statusCode < 300;
    }

    private String buildObjectUploadUrl(String objectPath) {
        return buildBaseUrl() + "/storage/v1/object/" + bucket + "/" + encodeObjectPath(objectPath);
    }

    private String buildObjectReadUrl(String objectPath) {
        return buildBaseUrl() + "/storage/v1/object/" + bucket + "/" + encodeObjectPath(objectPath);
    }

    private String buildObjectDeleteUrl() {
        return buildBaseUrl() + "/storage/v1/object/" + bucket;
    }

    private String buildBaseUrl() {
        return supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
    }

    private String getStoredFilePath(String fileName) {
        return bucket + "/" + fileName;
    }

    private String extractObjectPath(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new RuntimeException("File path is required");
        }

        String cleaned = filePath.replace('\\', '/');
        if (cleaned.startsWith(bucket + "/")) {
            return cleaned.substring(bucket.length() + 1);
        }
        if (cleaned.startsWith("/" + bucket + "/")) {
            return cleaned.substring(bucket.length() + 2);
        }
        return cleaned.startsWith("/") ? cleaned.substring(1) : cleaned;
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String encodePathSegment(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String encodeObjectPath(String objectPath) {
        String[] parts = objectPath.split("/");
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                builder.append('/');
            }
            builder.append(encodePathSegment(parts[i]));
        }
        return builder.toString();
    }

    public String getSignedUrl(String filePath) {
        try {
            String objectPath = extractObjectPath(filePath);
            String url = buildBaseUrl() + "/storage/v1/object/sign/" + bucket + "/" + encodeObjectPath(objectPath);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + serviceKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString("{\"expiresIn\":3600}"))
                    .build();

            HttpResponse<String> response = sendStringRequest(request);
            if (!isSuccess(response.statusCode())) {
                throw new RuntimeException("Failed to get signed URL: " + response.body());
            }

            String body = response.body();
            int start = body.indexOf("\"signedURL\":\"");
            int keyLen = 13;
            if (start < 0) {
                start = body.indexOf("\"signedUrl\":\"");
                keyLen = 13;
            }
            if (start < 0) {
                throw new RuntimeException("Unexpected signed URL response: " + body);
            }
            start += keyLen;
            int end = body.indexOf('"', start);
            if (start < 13 || end <= start) {
                throw new RuntimeException("Unexpected signed URL response: " + body);
            }

            String signedPath = body.substring(start, end).replace("\\/", "/");
            if (signedPath.startsWith("http://") || signedPath.startsWith("https://")) {
                return signedPath;
            }
            if (!signedPath.startsWith("/")) {
                signedPath = "/" + signedPath;
            }
            // Supabase often returns paths like /object/sign/... which still require /storage/v1 prefix.
            if (signedPath.startsWith("/object/")) {
                signedPath = "/storage/v1" + signedPath;
            }
            return buildBaseUrl() + signedPath;
        } catch (Exception ex) {
            throw new RuntimeException("Could not generate signed URL for: " + filePath, ex);
        }
    }

    public long getFileSize(String filePath) {
        try {
            String signed = getSignedUrl(filePath);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(signed))
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            if (!isSuccess(response.statusCode())) {
                throw new RuntimeException("Failed to fetch metadata, status=" + response.statusCode());
            }

            String len = response.headers().firstValue("content-length").orElse("0");
            try {
                return Long.parseLong(len);
            } catch (NumberFormatException e) {
                return 0L;
            }
        } catch (Exception ex) {
            throw new RuntimeException("Could not get file size for: " + filePath, ex);
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
