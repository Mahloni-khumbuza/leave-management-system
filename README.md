# Leave Management System

## Project layout
```
.
├── backend/    # Spring Boot 3 (Java 17, Spring Security, JPA, Flyway, AWS SDK v2)
└── frontend/   # Angular 17 (NgModule + Reactive Forms)
```

## Prerequisites
- **JDK 17** and **Maven 3.9+** for the backend
- **Node.js 18+** and **npm** for the frontend
- **PostgreSQL 14+** running locally
- AWS account + S3 bucket for file uploads (deploy step)

## Local development

### Backend
```bash
cd backend
# Create the local DB first: createdb leave_management
# Optionally override env vars (see backend/src/main/resources/application.yml for defaults):
#   DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, AWS_REGION, AWS_S3_BUCKET, CORS_ORIGINS
mvn spring-boot:run
# API: http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm start
# App: http://localhost:4200
```

### Key API endpoints
| Method | Path                          | Auth          | Purpose                  |
|--------|-------------------------------|---------------|--------------------------|
| POST   | `/api/auth/register`          | public        | Create user              |
| POST   | `/api/auth/login`             | public        | Get JWT                  |
| POST   | `/api/leaves`                 | EMPLOYEE+     | Create leave request     |
| GET    | `/api/leaves/me`              | EMPLOYEE+     | My leave history         |
| GET    | `/api/leaves`                 | ADMIN         | All leave requests       |
| PATCH  | `/api/leaves/{id}/decision`   | ADMIN         | Approve / reject         |
| POST   | `/api/files/upload`           | EMPLOYEE+     | Upload to S3 (PDF/JPG/PNG, ≤5MB) |

## Overview
You will work in a Scrum team simulation to design, build, and deploy a Leave Management System using:

- Spring Boot (Backend)
- Angular 17 (Frontend)
- AWS S3 (file uploads)
- AWS EC2

The focus is on Agile collaboration, sprint execution, and deploying a production-style system.

## Scrum Simulation Requirements

### Team Roles (Member may be a developer and one of the roles at the same time)
- **Scrum Master**: Facilitates sprint process and removes blockers
- **Product Owner**: Defines priorities and accepts completed work
- **Developers**: Implement backend, frontend, and DevOps tasks

### Scrum Ceremonies

#### Sprint Planning
- Break system into user stories
- Define sprint goal
- Assign tasks to team members
- Estimate effort using story points or hours

#### Daily Standups
Each member must report:
- What was completed yesterday
- What is being worked on today
- Any blockers

#### Code Collaboration (Git)
- Use feature branches only
- All changes must go through Pull Requests
- At least one reviewer per PR
- Resolve merge conflicts collaboratively

#### Sprint Review
- Demonstrate working system
- Show EC2 deployment live
- Demonstrate S3 file upload functionality

#### Sprint Retrospective
- What went well
- What did not go well
- What should be improved in the next sprint

## System Requirements

### Core Features
- User authentication using JWT
- Role-based access control:
  - ADMIN
  - EMPLOYEE
- Create leave request
- Approve or reject leave requests
- View leave history

### AWS Requirements

#### AWS EC2 Deployment
- Deploy Spring Boot backend on AWS EC2
- Application must be publicly accessible via IP or domain
- Configure security groups correctly
- Use environment variables (no hardcoded secrets)

#### AWS S3 File Uploads
- Upload supporting documents (PDF, JPG, PNG)
- Store files in S3 bucket
- Save file URL in database
- Validate file type and size

### Database
- Use PostgreSQL or MySQL
- Connect securely to backend
- Use Flyway or Liquibase for migrations
- Do not use auto schema generation

## Git Collaboration Rules
- Use feature branches (example: `feature/auth`, `feature/leave`, `feature/s3-upload`)
- No direct commits to main branch
- All changes must go through Pull Requests
- Commit messages must be clear and descriptive

## Deliverables
- Fully working Leave Management System
- Git repository with complete PR history
- EC2 deployed backend URL (publicly accessible)
- Working AWS S3 file upload functionality
- Database migrations included
- Sprint documentation (planning, review, retrospective)

## Definition of Done
A task is considered complete only when:

### Development
- Feature is fully implemented and tested
- Code reviewed via Pull Request
- No critical bugs
- Clean layered architecture followed
- DTOs used instead of exposing entities

### AWS EC2 Deployment
- Backend deployed and running successfully on EC2
- API accessible via public IP or domain
- Security groups correctly configured
- Environment variables used properly

### AWS S3
- File upload works successfully
- Files stored in S3 bucket
- File URL saved in database
- File retrieval works correctly

### Scrum Process
- Sprint planning completed
- Daily standups conducted
- Sprint review completed with demo
- Retrospective documented

### Frontend Integration
- Fully integrated with backend APIs
- Loading states implemented
- Error handling implemented
- End-to-end workflow functional

## Learning Resources

### Scrum and Agile
- Home | Scrum Guides
- What is Agile? | Atlassian
- https://www.scrum.org/resources

### AWS EC2 and S3
- https://docs.aws.amazon.com/ec2/
- https://docs.aws.amazon.com/s3/
- AWS SDK for Java

### Git Collaboration
- About Git - GitHub Docs
- https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
- Pull requests documentation - GitHub Docs
