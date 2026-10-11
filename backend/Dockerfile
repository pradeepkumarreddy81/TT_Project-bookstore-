# Stage 1: Build stage with dependency caching
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy pom.xml and cache dependencies offline
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and build jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime stage on lightweight JRE
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy built artifact from builder stage
COPY --from=builder /build/target/bookstore-api-*.jar /app/app.jar

# Set production profile by default
ENV SPRING_PROFILES_ACTIVE=prod

# Render sets the PORT environment variable dynamically
EXPOSE 8080

# Memory optimized for Render free instances (512MB RAM) using Serial GC
ENTRYPOINT ["sh","-c","java -XX:MaxRAMPercentage=70 -XX:+UseSerialGC -jar /app/app.jar"]
