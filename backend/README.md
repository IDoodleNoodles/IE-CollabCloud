# CollabCloud Backend (Spring Boot)

This is a scaffolded Spring Boot backend implementing entities and CRUD endpoints that follow the ERD/class diagrams you provided.

Quick start (requires Java 11+ and Maven):

```pwsh
cd backend
mvn spring-boot:run
```

By default the project uses an in-memory H2 database for quick development. Update `src/main/resources/application.properties` to point to your database (Postgres, MySQL, etc.) and add the corresponding JDBC driver dependency to `pom.xml` if needed.

Available REST endpoints (CRUD):
- `GET /api/users`, `GET /api/users/{id}`, `POST /api/users`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`
- `GET /api/projects`, ...
- `GET /api/files`, ...
- `GET /api/versions`, ...
- `GET /api/comments`, ...
- `GET /api/activitylogs`, ...

Notes:
- Relationships (owner -> project, project -> files, file -> versions/comments, project -> activity logs) match the ERD you attached.
- You mentioned you'll handle DB connections; configure `application.properties` with your JDBC URL and credentials and (optionally) change `spring.jpa.hibernate.ddl-auto` to `validate` or `none`.
- This scaffold intentionally keeps controllers simple and uses entities directly; for production consider DTOs and validation.
