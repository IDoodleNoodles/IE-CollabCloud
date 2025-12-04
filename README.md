# CollabCloud

CollabCloud is an online platform inspired by GitHub but created to be more inclusive and user-friendly for everyone, particularly students, beginners, and hobbyists. While GitHub primarily targets software development and version control, CollabCloud supports all kinds of projects—whether they're code, documents, designs, or even notes—allowing users to easily share, collaborate on, and store their work in one place. The goal is to simplify project sharing and foster a collaborative environment that's open to all. This repository contains a React + Vite TypeScript frontend integrated with a Spring Boot backend; the frontend calls the REST API for persistent operations.



## Tech StackQuick start (PowerShell):



- **Frontend**: React + TypeScript + Vite```powershell

- **Backend**: Spring Boot 2.7.12 (Java 21)npm install

- **Database**: MySQL 8.0npm run dev

- **Build Tools**: Maven (backend), npm (frontend)```



## PrerequisitesOpen http://localhost:5173 in your browser.



- **Node.js** (v16 or higher) and npmWhat this implements (demo):

- **Java JDK** 21- User register/login (stored in localStorage)

- **Maven** 3.8+- Project creation by uploading files

- **MySQL** 8.0+ (running locally on port 3306)- Project listing and file download

- Simple text editor with commit messages and version history

## Database Setup- Commenting list (localStorage, simulated notifications)

- Profile and simple forums pages

1. **Create the database** in MySQL:

```sqlNotes:

CREATE DATABASE dbcollabcloud;- This is a frontend-only demo. Replace localStorage code with API calls when adding a backend.

```CollabCloud is an online platform inspired by GitHub but created to be more inclusive and user-friendly for everyone, particularly students, beginners, and hobbyists. While GitHub primarily targets software development and version control, CollabCloud supports all kinds of projects—whether they’re code, documents, designs, or even notes—allowing users to easily share, collaborate on, and store their work in one place. The goal is to simplify project sharing and foster a collaborative environment that’s open to all.

2. **Update database credentials** (if needed) in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=123456
```

## Running the Application

### 1. Start the Backend (Spring Boot)

From the project root:

```powershell
# Build and run Spring Boot
mvn -f backend spring-boot:run
```

The backend will start on **http://localhost:8080**

- Hibernate will auto-create tables on first run (`spring.jpa.hibernate.ddl-auto=update`)
- Check backend logs to confirm successful MySQL connection

### 2. Start the Frontend (Vite)

In a **separate terminal**, from the project root:

```powershell
# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

The frontend will start on **http://localhost:5173**

- Vite dev proxy forwards API requests to the backend automatically
- The app uses the real MySQL database via Spring Boot REST API

### 3. Access the Application

Open **http://localhost:5173** in your browser and:
- Register a new user account
- Create projects by uploading files
- Explore version control, comments, and forums

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

- **User Authentication**: Register/login with email and password
- **Project Management**: Create projects by uploading files
- **File Operations**: Upload, download, and delete files
- **Version Control**: Save file versions with commit messages, restore previous versions
- **Comments**: Add comments to projects
- **Activity Logs**: Track project activities
- **Forums**: Create and participate in discussion topics
- **User Profiles**: Manage user information

## Development Notes

### CORS Configuration
- The backend allows `http://localhost:5173` for development
- For production, update `CorsConfig.java` to use your domain

### Database Connection
- Uses `allowPublicKeyRetrieval=true` for MySQL caching_sha2_password authentication
- For production, configure SSL or use mysql_native_password

### Security TODOs
- ⚠️ Passwords currently stored in plain text - implement BCrypt hashing
- ⚠️ Mock JWT tokens - implement real JWT authentication
- ⚠️ Add input validation and sanitization
- ⚠️ Add rate limiting and CSRF protection

## Troubleshooting

**Backend won't start:**
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Confirm credentials in `application.properties`

**Frontend can't reach backend:**
- Ensure backend is running on port 8080
- Check browser console for CORS errors
- Verify `.env.local` has `VITE_API_BASE=http://localhost:8080`

**Database connection error:**
- Check MySQL is running on localhost:3306
- Verify user credentials are correct
- Ensure database `dbcollabcloud` exists
