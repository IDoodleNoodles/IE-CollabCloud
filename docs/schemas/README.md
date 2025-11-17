# CollabCloud JSON Schemas

This document describes the data structures used in CollabCloud.

## User

```json
{
  "id": "u_1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "password": "hashed_password_here"
}
```

## Project

```json
{
  "id": "p_1234567890",
  "name": "My Project",
  "ownerId": "u_1234567890",
  "createdAt": 1700000000000,
  "updatedAt": 1700000000000,
  "files": [
    {
      "id": "f_1234567890",
      "name": "document.txt",
      "type": "text/plain",
      "dataUrl": "data:text/plain;base64,SGVsbG8gV29ybGQ=",
      "size": 1024,
      "projectId": "p_1234567890",
      "uploadedAt": 1700000000000
    }
  ]
}
```

## Version

```json
{
  "id": "v_1234567890",
  "projectId": "p_1234567890",
  "fileId": "f_1234567890",
  "content": "File content here",
  "message": "Updated documentation",
  "author": "user@example.com",
  "ts": 1700000000000
}
```

## Comment

```json
{
  "id": "c_1234567890",
  "projectId": "p_1234567890",
  "fileId": "f_1234567890",
  "text": "Great work on this file!",
  "author": "user@example.com",
  "ts": 1700000000000
}
```

## Collaborator

```json
{
  "id": "col_1234567890",
  "email": "collaborator@example.com",
  "name": "Jane Smith",
  "permission": "edit",
  "addedAt": 1700000000000
}
```

**Permission Levels:**
- `view`: Can only view files
- `edit`: Can view and edit files
- `admin`: Can manage project, add/remove collaborators

## Profile

```json
{
  "name": "John Doe",
  "bio": "Software developer and open source enthusiast",
  "interests": "Web development, Cloud computing",
  "website": "https://johndoe.com"
}
```

## Activity Log

```json
{
  "id": "al_1234567890",
  "type": "UPLOAD_FILE",
  "description": "Uploaded file: document.txt to project: My Project",
  "timestamp": 1700000000000,
  "userId": "u_1234567890"
}
```

**Activity Types:**
- `LOGIN`, `LOGOUT`
- `VIEW_DASHBOARD`, `VIEW_PROJECTS`
- `CREATE_PROJECT`, `DELETE_PROJECT`
- `UPLOAD_FILE`, `EDIT_FILE`, `DELETE_FILE`
- `SAVE_VERSION`
- `ADD_COMMENT`, `DELETE_COMMENT`
- `ADD_COLLABORATOR`, `REMOVE_COLLABORATOR`
- `SEARCH`

## Dashboard Stats

```json
{
  "projects": 5,
  "totalFiles": 23,
  "collaborators": 3,
  "versions": 45
}
```

## Authentication Response

```json
{
  "user": {
    "id": "u_1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## LocalStorage Keys

CollabCloud uses the following localStorage keys:

- `collab_users` - Array of User objects
- `collab_user` - Currently logged in User object
- `collab_token` - Authentication token (when using backend)
- `collab_projects` - Array of Project objects
- `collab_versions` - Array of Version objects
- `collab_comments` - Array of Comment objects
- `collab_profile` - Profile object for current user
- `collab_activity_logs` - Array of ActivityLog objects
- `collab_project_{projectId}_collaborators` - Array of Collaborators per project
