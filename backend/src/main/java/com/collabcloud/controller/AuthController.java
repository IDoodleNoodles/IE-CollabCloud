package com.collabcloud.controller;

import com.collabcloud.entity.UserEntity;
import com.collabcloud.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String name = request.get("name");

            if (email == null || password == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email and password are required");
                return ResponseEntity.badRequest().body(error);
            }

            if (userService.existsByEmail(email)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            UserEntity user = new UserEntity();
            user.setEmail(email);
            user.setPassword(password); // Note: In production, hash this password!
            user.setName(name != null ? name : email.split("@")[0]);
            user.setRole("USER");

            UserEntity savedUser = userService.createUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getUserId());
            response.put("userId", savedUser.getUserId());
            response.put("email", savedUser.getEmail());
            response.put("name", savedUser.getName());
            response.put("role", savedUser.getRole());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error during registration: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || password == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email and password are required");
                return ResponseEntity.badRequest().body(error);
            }

            UserEntity user = userService.getUserByEmail(email)
                    .orElse(null);

            if (user == null || !user.getPassword().equals(password)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid credentials");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Update last login
            userService.updateLastLogin(user.getUserId());

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getUserId());
            response.put("userId", user.getUserId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during login: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (!userService.existsByEmail(email)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // In production, send actual password reset email
            Map<String, Object> response = new HashMap<>();
            response.put("ok", true);
            response.put("message", "Password reset email sent");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during password reset: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
