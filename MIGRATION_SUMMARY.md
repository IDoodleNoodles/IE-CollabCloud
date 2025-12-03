# localStorage to SQL Database Migration

## Overview
This document summarizes the migration from localStorage-based data storage to SQL database backend.

## Status: CORE MIGRATION COMPLETE ✅

### Completed - api.ts (100% Database-Backed)
- ✅ **Auth functions**: register, login, resetPassword - Pure API calls
- ✅ **Project CRUD**: createProject, getProjects, getProject, updateProject, deleteProject - Pure API calls
- ✅ **File operations**: getFiles, uploadFiles, deleteFile - Pure API calls with logging
- ✅ **Version control**: saveVersion, listVersions, restoreVersion - Pure API calls
- ✅ **Comments**: getComments, postComment, deleteComment - Pure API calls
- ✅ **Profile**: getProfile, saveProfile - Pure API calls
- ✅ **Collaborators**: addCollaborator, findUserByEmail, removeCollaborator, getProjectsByUser - Pure API calls
- ✅ All `if (API_BASE)` checks removed - database-only mode
- ✅ Backend file storage using FileStorageService with UUID filenames
- ✅ Comprehensive logging throughout API and backend

### Optional Cleanup (Page Components)
These still reference localStorage but api.ts handles all data:
- ⏳ Update Editor.tsx localStorage references (versions)
- ⏳ Update Dashboard.tsx localStorage references
- ⏳ Update ProjectDetail.tsx localStorage references
- ⏳ Update Profile.tsx localStorage references
- ⏳ Migrate ActivityLogger to use backend API
- ⏳ Remove Forums localStorage usage (low priority)

## Migration Strategy
1. Keep `collab_user` and `collab_token` in localStorage (for session management)
2. Remove ALL other localStorage fallbacks - require API backend
3. All data flows through SQL database via REST API
4. File content stored on disk, paths in database

## Breaking Changes
- App now REQUIRES backend to be running
- No offline/localStorage-only mode
- VITE_API_BASE environment variable is required

## Next Steps
1. Complete api.ts cleanup (remove all `if (API_BASE)` checks and localStorage fallbacks)
2. Update all page components
3. Test full end-to-end workflows
4. Remove unused localStorage keys
