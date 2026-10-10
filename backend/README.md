# Bookstore API (Spring Boot 3.x)

Backend RESTful API service for the Online Bookstore monorepo built with Java 17, Spring Boot 3.x, Spring Data JPA, Spring Security, and MySQL.

---

## Architecture & Tech Stack

- **Framework**: Spring Boot 3.3.4 (Java 17)
- **Build Tool**: Apache Maven
- **Database**: MySQL 8.0+
- **Security**: Spring Security 6 with BCrypt password hashing & stateless session management
- **Persistence**: Spring Data JPA & Hibernate
- **Validation**: Jakarta Bean Validation
- **Boilerplate Reduction**: Project Lombok

---

## Directory Structure

```text
bookstore/
├── backend/
│   ├── .env                    # Local environment variables (git-ignored)
│   ├── .env.example            # Template for environment variables
│   ├── pom.xml                 # Maven configuration and dependencies
│   ├── README.md               # Backend documentation
│   └── src/
│       ├── main/
│       │   ├── java/com/bookstore/
│       │   │   ├── config/      # DataSeeder, StartupLogger
│       │   │   ├── controller/  # BookController, CategoryController, HealthController
│       │   │   ├── dto/         # DTO classes (BookDto, CategoryDto, ApiResponse)
│       │   │   ├── entity/      # JPA Entities (User, Category, Book, CartItem, Order, OrderItem)
│       │   │   ├── exception/   # GlobalExceptionHandler, Custom exceptions
│       │   │   ├── repository/  # Spring Data JPA Repositories
│       │   │   ├── security/    # SecurityConfig, PasswordEncoder, CORS
│       │   │   └── service/     # Business logic & services
│       │   └── resources/
│       │       ├── application.properties       # Local profile (dev)
│       │       └── application-prod.properties  # Production profile (Render cloud MySQL)
│       └── test/
└── frontend/                   # Frontend client (managed separately)
```

---

## Environment Configuration (.env)

The application loads configuration keys from `backend/.env` using Spring Boot's `spring.config.import=optional:file:.env[.properties]`. In production environments (like Render), keys are set directly as environment variables.

### Variables

| Key | Description | Example / Default |
|---|---|---|
| `DB_URL` | JDBC Connection URL | `jdbc:mysql://localhost:3306/bookstore_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `your_mysql_password` |
| `JWT_SECRET` | Secret key for JWT tokens | 256-bit secret string |
| `JWT_EXPIRATION_MS` | JWT expiration in milliseconds | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000,http://localhost:5173` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` or `prod` |
| `PORT` | HTTP server port | `8080` |
| `ADMIN_EMAIL` | Initial admin account email | `admin@bookstore.com` |
| `ADMIN_PASSWORD` | Initial admin account password | `Admin@123` *(REQUIRED in prod)* |
| `DDL_AUTO` | Hibernate DDL mode | `update` *(or `validate` in prod)* |

---

## Running MySQL Locally

1. **Start MySQL Service**:
   - On Windows: Open Services (`services.msc`) and ensure `MySQL80` (or `mysql`) is running, or execute:
     ```powershell
     Start-Service MySQL80
     ```
2. **Configure `.env`**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `DB_PASSWORD` to match your local MySQL root password.
   - The database `bookstore_db` will automatically be created on first launch via `createDatabaseIfNotExist=true`.

---

## Pointing the App at a Cloud MySQL (e.g. Render / Aiven)

To connect to a managed cloud MySQL database:

1. Open `backend/.env` (or set environment variables on the Render dashboard):
   ```properties
   DB_URL=jdbc:mysql://<cloud-host>:<port>/<dbname>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
   DB_USERNAME=<cloud-username>
   DB_PASSWORD=<cloud-password>
   SPRING_PROFILES_ACTIVE=prod
   ADMIN_PASSWORD=YourStrongProdPassword123!
   DDL_AUTO=update
   ```

2. **Cloud Profile Features (`application-prod.properties`)**:
   - **Fail-Fast**: No localhost fallback defaults; missing database variables immediately fail with an actionable error.
   - **Connection Pool Tuning**: HikariCP is pre-configured for cloud databases with aggressive idle connection dropping (`maximum-pool-size=5`, `minimum-idle=1`, `max-lifetime=900000`, `keepalive-time=300000`).
   - **SQL Logging Disabled**: Reduces log noise and prevents sensitive query logging in production.
   - **Mandatory Admin Credentials**: `ADMIN_PASSWORD` has no default fallback to prevent accidental deployment with default credentials.

---

## Starting the Application

From the root repository or bookstore directory:

```bash
cd backend
mvn spring-boot:run
```

### Startup Log Verification

When the application boots, `StartupLogger` prints a startup diagnostic banner displaying the active profile and database host:port (with credentials strictly excluded):

```text
================================================================================
ONLINE BOOKSTORE API STARTED
Active Profile(s) : [dev]
Database Host/Port: localhost:3306
================================================================================
```

---

## Automatic Data Seeding

On startup, `DataSeeder` runs via `CommandLineRunner`:
- **Admin Account**: Creates `admin@bookstore.com` with a BCrypt-hashed password if the `users` table is empty.
- **Catalog**: Creates **5 categories** and **20 realistic books** (with actual titles, authors, ISBNs, descriptions, prices, stock, and Unsplash cover image URLs) if the tables are empty.

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and active profile |
| `GET` | `/api/books` | Paginated books search & filter (`?query=...&categoryId=...&page=0&size=10`) |
| `GET` | `/api/books/{id}` | Book details by ID |
| `GET` | `/api/books/isbn/{isbn}` | Book details by ISBN |
| `GET` | `/api/books/featured` | Top featured books |
| `GET` | `/api/categories` | List all categories with book counts |
| `GET` | `/api/categories/{id}` | Category details by ID |
