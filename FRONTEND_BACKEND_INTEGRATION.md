# Frontend-Backend Integration Guide

## Overview
This document outlines the comprehensive updates made to integrate the CollabCloud frontend with the Spring Boot backend API.

## API Configuration

### Environment Setup
Create a `.env` file in the root directory (use `.env.example` as template):

```env
VITE_API_BASE=http://localhost:8080
```

**Note:** This integration requires `VITE_API_BASE` and a running backend. The application no longer falls back to a localStorage-only mode.

## API Endpoint Mappings

### Backend URL Structure
- **Auth Endpoints:** `/auth/*`
- **All Other Endpoints:** `/api/*`

### Key Changes Made

#### 1. Authentication Endpoints
| Frontend Method | Backend Endpoint | HTTP Method |
|----------------|------------------|-------------|
| `api.register()` | `/auth/register` | POST |
| `api.login()` | `/auth/login` | POST |
| `api.resetPassword()` | `/auth/reset-password` | POST |

#### 2. Project Endpoints
| Frontend Method | Backend Endpoint | HTTP Method |
|----------------|------------------|-------------|
| `api.getProjects()` | `/api/projects` | GET |
| `api.getProject(id)` | `/api/projects/{id}` | GET |
| `api.createProject()` | `/api/projects` | POST |
| `api.updateProject(id)` | `/api/projects/{id}` | PUT |
| `api.deleteProject(id)` | `/api/projects/{id}` | DELETE |
| `api.addCollaborator()` | `/api/projects/{projectId}/collaborators/{userId}` | POST |
| `api.removeCollaborator()` | `/api/projects/{projectId}/collaborators/{userId}` | DELETE |
| `api.getProjectsByUser(userId)` | `/api/projects/creator/{userId}` + `/api/projects/collaborator/{userId}` | GET |

#### 3. File Endpoints
| Frontend Method | Backend Endpoint | HTTP Method |
|----------------|------------------|-------------|
| `api.uploadFiles()` | `/api/files` | POST |
| `api.deleteFile(projectId, fileId)` | `/api/files/{fileId}` | DELETE |

#### 4. Version Endpoints
| Frontend Method | Backend Endpoint | HTTP Method |
|----------------|------------------|-------------|
| `api.saveVersion()` | `/api/versions` | POST |
| `api.listVersions()` | `/api/versions` | GET |
| `api.restoreVersion()` | `/api/versions/{versionId}` + `/api/files/{fileId}` | GET + PUT |

#### 5. Comment Endpoints
| Frontend Method | Backend Endpoint | HTTP Method |
|----------------|------------------|-------------|
| `api.getComments()` | `/api/comments` | GET |
| `api.postComment()` | `/api/comments` | POST |
| `api.deleteComment(id)` | `/api/comments/{id}` | DELETE |

#### 6. User/Profile Endpoints
| Frontend Method | Backend Endpoint | HTTP Method |
|----------------|------------------|-------------|
| `api.getProfile()` | `/api/users/{userId}` | GET |
| `api.saveProfile()` | `/api/users/{userId}` | PUT |

## Field Mapping Transformations

### User Object
**Backend (UserEntity):**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "password": "hashed_password"
}
```

**Frontend (User):**
```json
{
  "id": "1",
  "userId": "1",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

### Project Object
**Backend (ProjectEntity):**
```json
{
  "projectId": 1,
  "title": "My Project",
  "description": "Project description",
  "createdDate": "2024-01-01T00:00:00",
  "lastModified": "2024-01-01T00:00:00",
  "creator": { "userId": 1, "email": "user@example.com" },
  "collaborators": [],
  "files": []
}
```

**Frontend (Project):**
```json
{
  "id": "1",
  "name": "My Project",
  "description": "Project description",
  "createdAt": 1704067200000,
  "updatedAt": 1704067200000,
  "ownerId": "1",
  "files": []
}
```

### File Object
**Backend (FileEntity):**
```json
{
  "fileId": 1,
  "fileName": "document.txt",
  "fileType": "text/plain",
  "filePath": "/path/to/file",
  "uploadDate": "2024-01-01T00:00:00",
  "project": { "projectId": 1 }
}
```

**Frontend (ProjectFile):**
```json
{
  "id": "1",
  "name": "document.txt",
  "type": "text/plain",
  "dataUrl": "/path/to/file",
  "projectId": "1",
  "uploadedAt": 1704067200000
}
```

### Comment Object
**Backend (CommentEntity):**
```json
{
  "commentId": 1,
  "content": "Great work!",
  "createdDate": "2024-01-01T00:00:00",
  "user": { "userId": 1, "email": "user@example.com" },
  "file": { "fileId": 1, "project": { "projectId": 1 } }
}
```

**Frontend (Comment):**
```json
{
  "id": "1",
  "text": "Great work!",
  "author": "user@example.com",
  "ts": 1704067200000,
  "projectId": "1",
  "fileId": "1"
}
```

### Version Object
**Backend (VersionEntity):**
```json
{
  "versionId": 1,
  "content": "file content",
  "commitMessage": "Initial commit",
  "createdDate": "2024-01-01T00:00:00",
  "user": { "userId": 1, "email": "user@example.com" },
  "file": { "fileId": 1, "project": { "projectId": 1 } }
}
```

**Frontend (Version):**
```json
{
  "id": "1",
  "content": "file content",
  "message": "Initial commit",
  "author": "user@example.com",
  "ts": 1704067200000,
  "projectId": "1",
  "fileId": "1"
}
```

## Mapper Functions

The following mapper functions have been added to `src/services/api.ts`:

- `mapServerUser(u: any)` - Converts backend UserEntity to frontend User
- `mapServerProject(p: any)` - Converts backend ProjectEntity to frontend Project
- `mapServerFile(f: any)` - Converts backend FileEntity to frontend ProjectFile
- `mapServerComment(c: any)` - Converts backend CommentEntity to frontend Comment
- `mapServerVersion(v: any)` - Converts backend VersionEntity to frontend Version

These mappers handle:
- ID type conversion (Long to String)
- Field name mapping (e.g., `title` → `name`, `commentId` → `id`)
- Date conversion (LocalDateTime to Unix timestamp)
- Nested object flattening (e.g., `creator.userId` → `ownerId`)

## Authentication Flow

### Registration
1. Frontend sends: `{ email, password, name }`
2. Backend creates UserEntity with auto-generated `userId`
3. Backend returns: `{ userId, email, name, role }`
4. Frontend maps to User object with `id` and `userId` fields

### Login
1. Frontend sends: `{ email, password }`
2. Backend validates credentials
3. Backend returns: `{ userId, email, name, role, accessToken? }`
4. Frontend stores token (if provided) and maps user object
5. Frontend stores current user in the centralized `session` service (cookies + in-memory). Do not rely on `localStorage`.

## Creating Projects

When creating a project, the frontend now:
1. Retrieves current user from `session.getUser()` or `api.getProfile()`
2. Extracts `userId` (or `id` as fallback)
3. Sends to backend:
```json
{
  "title": "Project Name",
  "description": "",
  "creator": { "userId": 1 }
}
```
4. Backend creates ProjectEntity with relationships
5. Backend returns full project with nested entities
6. Frontend maps response using `mapServerProject()`

## Files Updated

### Core API Files
- ✅ `src/services/api.ts` - Complete rewrite with backend integration
- ✅ `src/services/auth.tsx` - Updated to handle backend user structure
- ✅ `src/types/index.ts` - Added `description` field to Project interface

### Pages Updated
- ✅ `src/pages/Versions.tsx` - Now uses api.ts instead of localStorage
- ✅ `src/pages/Comments.tsx` - Already using api.ts (verified)
- ✅ `src/pages/Projects.tsx` - Already using api.ts (verified)
- ✅ `src/pages/Dashboard.tsx` - Uses localStorage for stats (can be enhanced)

### Configuration Files
- ✅ `.env.example` - Created with VITE_API_BASE configuration

## Testing the Integration

### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
```
Backend will run on `http://localhost:8080`

### 2. Configure Frontend
```bash
# Create .env file
echo "VITE_API_BASE=http://localhost:8080" > .env
```

### 3. Start Frontend
```bash
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

### 4. Test Scenarios

#### Registration
1. Navigate to `/auth`
2. Register a new user
3. Check backend logs for user creation
4. Verify user is logged in automatically

#### Create Project
1. Navigate to `/projects?action=upload`
2. Enter project name and select files
3. Submit form
4. Verify project appears in list
5. Check backend database for ProjectEntity

#### Comments
1. Navigate to `/comments`
2. Add a new comment
3. Verify it appears in the list
4. Check backend for CommentEntity

#### Versions
1. Open a file in the editor
2. Make changes and save
3. Navigate to `/versions`
4. Verify version history appears
5. Test restore functionality

## Common Issues and Solutions

### Issue: "Invalid credentials" on login
**Solution:** Ensure user exists in backend database with matching email and password.

### Issue: Projects not loading
**Solution:** 
1. Check VITE_API_BASE is set correctly
2. Verify backend is running on port 8080
3. Check browser console for CORS errors
4. Verify WebConfig allows localhost:5173

### Issue: Type conversion errors
**Solution:** All IDs are converted to strings in mapper functions. Ensure backend returns numeric IDs.

### Issue: 404 on API calls
**Solution:** Verify endpoint paths match backend @RequestMapping annotations.

## Backend CORS Configuration

The backend `WebConfig.java` is configured to allow:
- Origins: `http://localhost:5173`, `http://localhost:3000`
- Methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
- Headers: All (`*`)
- Credentials: Enabled

If deploying to production, update allowed origins accordingly.

## Future Enhancements

1. **Activity Logs API**: Backend endpoint for `/api/activity-logs` to replace localStorage
2. **File Upload**: Implement proper file storage on backend (currently stores file paths)
3. **Authentication Tokens**: Implement JWT tokens for secure API access
4. **Real-time Updates**: WebSocket integration for collaborative editing
5. **Search API**: Backend endpoint for full-text search across projects/files
6. **Dashboard Stats API**: Aggregate statistics endpoint for dashboard

## Summary

All frontend API calls have been updated to:
✅ Use correct `/api` prefix for non-auth endpoints
✅ Map backend field names to frontend expectations
✅ Convert data types appropriately (Long → String, LocalDateTime → timestamp)
✅ Handle nested relationships from backend entities
✅ Application no longer supports a localStorage-only fallback; prefer backend API and `session` service

The application now seamlessly works with both:
- **Backend API mode** (when `VITE_API_BASE` is set)
- **localStorage mode**: removed — the app relies on the backend API and session management

This provides flexibility for development and testing scenarios.
