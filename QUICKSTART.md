# CollabCloud - Quick Start Guide

## Prerequisites
- Java 11 or higher
- Maven 3.6+
- Node.js 16+ and npm
- MySQL 8.0+

## Backend Setup

### 1. Configure Database
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dbcollabcloud
spring.datasource.username=root
spring.datasource.password=your_password
```

### 2. Create Database
```sql
CREATE DATABASE dbcollabcloud;
```

### 3. Run Backend
```bash
cd backend
mvn spring-boot:run
```

Backend will start on **http://localhost:8080**

## Frontend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Connection
Create `.env` file in root directory:
```env
VITE_API_BASE=http://localhost:8080
```

**Note:** If you omit this file, the app will use localStorage mode (no backend required).

### 3. Run Frontend
```bash
npm run dev
```

Frontend will start on **http://localhost:5173**

## Test the Application

### 1. Register a User
- Go to http://localhost:5173/auth
- Click "Sign Up"
- Enter email, password, and name
- You'll be automatically logged in

### 2. Create a Project
- Click "New Project" from dashboard
- Enter project name
- Upload files (or select sample files)
- Click "Create Project"

### 3. Collaborate
- Open a project
- Click "Manage Collaborators"
- Add users by email
- They can now view/edit the project

### 4. Version Control
- Edit a file in the editor
- Click "Save Version" with a message
- View version history in "Versions" page
- Restore previous versions if needed

### 5. Comments & Activity
- Add comments on files
- View all activity in "Activity Logs"

## API Endpoints Reference

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/reset-password` - Reset password

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Files
- `GET /api/files` - List all files
- `GET /api/files/project/{projectId}` - Get files by project
- `POST /api/files` - Upload file
- `DELETE /api/files/{id}` - Delete file

### Versions
- `GET /api/versions` - List all versions
- `GET /api/versions/file/{fileId}` - Get versions for file
- `POST /api/versions` - Create version

### Comments
- `GET /api/comments` - List all comments
- `GET /api/comments/file/{fileId}` - Get comments for file
- `POST /api/comments` - Add comment
- `DELETE /api/comments/{id}` - Delete comment

### Collaborators
- `POST /api/projects/{projectId}/collaborators/{userId}` - Add collaborator
- `DELETE /api/projects/{projectId}/collaborators/{userId}` - Remove collaborator

## Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in application.properties
- Ensure port 8080 is not in use

### Frontend can't connect to backend
- Verify VITE_API_BASE in .env file
- Check backend is running on port 8080
- Look for CORS errors in browser console

### "Invalid credentials" error
- Ensure user is registered in backend database
- Password is stored as plain text (NOT recommended for production)

### Projects not appearing
- Check browser console for errors
- Verify API calls are going to /api/projects
- Check backend logs for SQL errors

## Development Mode

To run in localStorage mode (no backend needed):
1. Remove or rename the `.env` file
2. Run `npm run dev`
3. All data will be stored in browser localStorage

## Production Deployment

### Backend
```bash
cd backend
mvn clean package
java -jar target/collabcloud-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
npm run build
# Deploy 'dist' folder to your web server
```

Update `.env.production`:
```env
VITE_API_BASE=https://your-api-domain.com
```

## Additional Resources

- See `FRONTEND_BACKEND_INTEGRATION.md` for detailed API documentation
- See `IMPROVEMENTS.md` for planned features
- See `README.md` for project overview
