# Multi-stage build for a smaller production image
FROM maven:3.9.9-eclipse-temurin-11 AS build
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn -q -DskipTests clean package

FROM eclipse-temurin:11-jre
WORKDIR /app

# Copy packaged Spring Boot jar
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Use env vars for configuration at runtime
ENTRYPOINT ["java", "-jar", "app.jar"]
