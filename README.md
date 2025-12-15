# CollabCloud

Online platform for project collaboration, supporting code, documents, designs, and notes. Inspired by GitHub but inclusive for students, beginners, and hobbyists. React + Vite TypeScript frontend with Spring Boot backend.

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Spring Boot 2.7.12 (Java 21)
- Database: MySQL 8.0
- Build Tools: Maven (backend), npm (frontend)

## Prerequisites

- Node.js (v16+)
- Java JDK 21
- Maven 3.8+
- MySQL 8.0+

## Database Setup

1. Create database in MySQL:
   ```sql
   CREATE DATABASE dbcollabcloud;
   ```

2. Update credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=123456
   ```

## Running the Application

### Backend (Spring Boot)

From project root:
```powershell
mvn -f backend spring-boot:run
```
Starts on http://localhost:8080. Hibernate auto-creates tables.

### Frontend (Vite)

In separate terminal:
```powershell
npm install
npm run dev
```
Starts on http://localhost:5173. Proxy forwards API requests to backend.

## Access

Open http://localhost:5173. Register/login, create projects by uploading files, manage versions, comments, forums.

## Project Structure

```
IE-CollabCloud/
├── backend/                  # Spring Boot backend
│   ├── src/main/java/com/collabcloud/
│   │   ├── controller/      # REST API controllers
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   └── config/          # CORS and other configs
│   └── src/main/resources/
│       └── application.properties
├── src/                     # React frontend
│   ├── pages/              # Page components
│   └── services/
│       └── api.ts          # API client
├── vite.config.ts          # Vite config with proxy
├── package.json            # Frontend dependencies
└── .env.local              # Environment variables (VITE_API_BASE)
```

## Features

- User authentication (register/login)
- Project creation via file upload
- File operations (upload, download, delete)
- Version control with commit messages
- Comments on projects
- Activity logs
- Forums for discussions
- User profiles

## Development Notes

### CORS
Backend allows http://localhost:5173 for development. Update CorsConfig.java for production.

### Database
Uses allowPublicKeyRetrieval=true for MySQL. Configure SSL for production.

### Security TODOs
- Hash passwords with BCrypt
- Implement JWT authentication
- Add input validation
- Add rate limiting and CSRF protection

## Troubleshooting

**Backend won't start:**
- Verify MySQL running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Confirm credentials in application.properties

**Frontend can't reach backend:**
- Ensure backend on port 8080
- Check console for CORS errors
- Verify .env.local has VITE_API_BASE=http://localhost:8080

**Database connection error:**
- MySQL on localhost:3306
- Verify credentials
- Ensure dbcollabcloud exists
