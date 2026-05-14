# Non-Functional Requirements (NFR) - Mindello ASD Screening Platform

## Overview

This document outlines the non-functional requirements for the **Mindello** AI-powered Autism Spectrum Disorder (ASD) screening platform. Non-functional requirements specify the quality attributes, performance standards, security constraints, and operational characteristics that the system must meet, independent of specific functional behaviors.

---

## 1. Performance Requirements

### 1.1 Response Time

- **Prediction Response**: All ASD screening predictions must be returned to the user within **2 seconds** of form submission
- **Dashboard Load**: Dashboard with all visualizations must render within **3 seconds**
- **Page Load**: All static pages (home, about) must load within **1 second**
- **API Response**: RESTful endpoints must respond with JSON data within **500ms**

### 1.2 Throughput

- System must support **minimum 50 concurrent users** during peak hours
- Prediction API must handle **≥100 requests per minute** without degradation
- Database queries must complete within **200ms** for user history retrieval

### 1.3 Optimization

- Frontend assets (CSS, JS) must be minified and gzip-compressed
- All images must be optimized (max 100KB per image)
- Django template rendering must not exceed 100ms per page
- ML model prediction must not exceed 50ms per inference

---

## 2. Security Requirements

### 2.1 Authentication & Authorization

- **Multi-factor Authentication (MFA)**: Support optional SMS/email OTP verification
- **Password Policy**: Enforce minimum 8 characters, uppercase, lowercase, number, and special character
- **Session Timeout**: Sessions must expire after **30 minutes** of inactivity
- **Role-Based Access Control (RBAC)**:
  - Parent/Guardian role: Access only their own child's records
  - Medical Professional role: Access patient records they've created or been granted permission
  - Admin role: Full access to system and user management
- **JWT Tokens**: Optional token-based auth for API consumers with 1-hour expiration

### 2.2 Data Protection

- **Encryption in Transit**: All data transmitted over HTTPS with TLS 1.2+
- **Encryption at Rest**: Sensitive fields (SSN, medical IDs) encrypted with AES-256
- **Password Hashing**: Use bcrypt with salt for all user passwords (min 10 rounds)
- **Database Encryption**: SQLite encrypted at file system level or migrate to PostgreSQL with native encryption

### 2.3 Privacy Compliance

- **GDPR Compliance**: Implement data export and deletion features
- **HIPAA Considerations**: If handling real patient data, implement required security standards
- **Data Anonymization**: Prediction logs must not store personal identifiers (replace with user IDs)
- **Audit Logging**: Track all user access to sensitive data with timestamps

### 2.4 Input Validation

- **SQL Injection Prevention**: Use parameterized queries (Django ORM default)
- **XSS Prevention**: Sanitize all user inputs; use template auto-escaping
- **CSRF Protection**: Implement CSRF tokens on all forms
- **File Upload Security**: Restrict upload types; scan for malware if applicable

### 2.5 API Security

- **Rate Limiting**: Limit API calls to 100 requests per minute per user
- **API Key Management**: Generate and revoke API keys with proper logging
- **CORS Policy**: Restrict cross-origin requests to trusted domains only

---

## 3. Scalability Requirements

### 3.1 Horizontal Scaling

- Architecture must support **horizontal scaling** using Docker containers
- Session data must be stored in a centralized cache (Redis) rather than local memory
- Database must support read replicas for analytics queries

### 3.2 Vertical Scaling

- System must gracefully handle **2x the current user load** with minimal configuration changes
- Memory usage per request must not exceed **50MB**
- Database queries must remain optimized as data volume increases 10x

### 3.3 Data Volume Growth

- System must support **100,000+ prediction records** without performance degradation
- Prediction history queries must use pagination (max 50 records per request)
- Implement data archival strategy for records older than 2 years

---

## 4. Availability & Reliability

### 4.1 Uptime Requirements

- **Service Availability**: Target **99.5% uptime** annually (max 3.65 hours downtime)
- **Critical Components**: Prediction service must have **99.9% uptime** (max 8.76 hours/year)
- **Graceful Degradation**: If ML model fails, provide fallback heuristic scoring

### 4.2 Fault Tolerance

- **Database Failover**: Automatic failover to replica database within **30 seconds**
- **Connection Pooling**: Maintain DB connection pool with min 5, max 20 connections
- **Circuit Breaker Pattern**: External API calls should implement timeout (5s) and retry logic
- **Error Recovery**: System must automatically recover from transient failures (network glitches)

### 4.3 Backup & Disaster Recovery

- **Backup Frequency**: Database backups every **6 hours** to cloud storage (AWS S3/Azure Blob)
- **Recovery Time Objective (RTO)**: Restore service within **1 hour** of failure
- **Recovery Point Objective (RPO)**: Lose no more than **6 hours** of data
- **Disaster Recovery Drills**: Test recovery procedures quarterly

---

## 5. Maintainability Requirements

### 5.1 Code Quality

- **Code Coverage**: Maintain **≥80% test coverage** for critical modules
- **Documentation**: Every function must have docstring with parameters, return, and exceptions
- **Code Standards**: Follow PEP 8 style guide; use linters (pylint, flake8) in CI/CD
- **Complexity**: Cyclomatic complexity per function must not exceed **10**

### 5.2 Logging & Monitoring

- **Log Levels**: Implement DEBUG, INFO, WARNING, ERROR levels appropriately
- **Centralized Logging**: Aggregate logs to ELK Stack or CloudWatch
- **Error Tracking**: Integrate Sentry for real-time error alerts
- **Performance Monitoring**: Track response times, error rates, and resource usage with Prometheus/Grafana

### 5.3 Deployment & Version Control

- **Version Control**: Use semantic versioning (v1.2.3) for releases
- **CI/CD Pipeline**: Automated testing and deployment on every commit
- **Environment Management**: Separate dev, staging, and production configurations
- **Database Migrations**: Track schema changes with Django migrations; test rollbacks

---

## 6. Usability Requirements

### 6.1 User Interface

- **Accessibility**: WCAG 2.1 Level AA compliance (keyboard navigation, screen reader support)
- **Mobile Responsiveness**: Fully functional on devices ≥320px width
- **Load Time Perception**: Show progress indicators for operations ≥1 second
- **Dark/Light Mode**: Support theme toggle persisted in user preferences

### 6.2 User Experience

- **Form Validation**: Real-time inline validation with clear error messages
- **Confirmation Dialogs**: Confirm before destructive actions (delete records)
- **Undo Functionality**: Allow users to undo recent actions where applicable
- **Onboarding**: New users should complete screening within **5 minutes** on first visit
- **Help System**: In-app tooltips and FAQ section for common questions

### 6.3 Internationalization (i18n)

- **Language Support**: English (primary); support for Spanish, French as secondary
- **Date/Time Formatting**: Localize based on user timezone and locale
- **RTL Support**: Prepare infrastructure for right-to-left languages

---

## 7. Compatibility Requirements

### 7.1 Browser Compatibility

- **Desktop**: Chrome (latest 2 versions), Firefox (latest 2), Safari 12+, Edge 18+
- **Mobile**: iOS Safari 12+, Chrome Android (latest 2 versions)
- **Graceful Degradation**: Functionality preserved even if JavaScript disabled

### 7.2 Platform Compatibility

- **Backend**: Python 3.9+ with Django 4.2 LTS
- **Database**: SQLite (dev), PostgreSQL 12+ (production)
- **Frontend**: Bootstrap 5.3, vanilla JavaScript (no jQuery dependency)
- **Deployment**: Support for Linux (Ubuntu 20.04+), Docker, Cloud platforms

### 7.3 Third-Party Dependencies

- **Vendor Lock-in**: Minimize proprietary dependencies; prefer open-source
- **Dependency Updates**: Review and test dependency updates monthly
- **Deprecated Libraries**: Plan migration path for deprecated packages (e.g., Python 2 → 3)

---

## 8. Compliance & Legal Requirements

### 8.1 Medical/Healthcare Compliance

- **Disclaimer**: Prominent disclaimer that tool is **not a clinical diagnosis** and cannot replace professional evaluation
- **Clinical Validation**: All screening algorithms must be validated against peer-reviewed studies
- **Liability**: Clear terms of service limiting platform liability

### 8.2 Data Governance

- **Data Retention Policy**: Retain user data for **2 years** after account deletion, then purge
- **Data Breach Notification**: Notify affected users within **72 hours** of breach discovery
- **Compliance Audits**: Annual third-party security audit and penetration testing

### 8.3 Accessibility Laws

- **ADA Compliance**: Ensure website complies with Americans with Disabilities Act
- **Section 508**: If serving U.S. government, comply with Section 508 accessibility standards

---

## 9. Operational Requirements

### 9.1 Support & SLA

- **Support Channels**: Email support with **24-hour response time**
- **Critical Issues**: Severity 1 (system down) resolved within **4 hours**
- **Scheduled Maintenance**: Perform updates during **low-traffic windows** (2-4 AM UTC)
- **Maintenance Windows**: Notify users **48 hours** in advance

### 9.2 Monitoring & Alerting

- **Automated Alerts**: Alert on CPU >80%, memory >85%, disk >90% usage
- **Error Rate Alerts**: Alert if error rate exceeds 1% of requests
- **Model Degradation**: Alert if prediction confidence drops below threshold
- **Health Checks**: Ping health endpoint every 60 seconds

### 9.3 Capacity Planning

- **Usage Forecasting**: Project 20% year-over-year growth
- **Resource Provisioning**: Scale infrastructure **before** reaching 70% capacity
- **Load Testing**: Conduct load tests quarterly to identify bottlenecks

---

## 10. Cost & Resource Requirements

### 10.1 Infrastructure Costs

- **Target**: Keep hosting costs under **$500/month** at current scale
- **Server**: Single or load-balanced instances (t3.medium equivalent)
- **Database**: Managed PostgreSQL with automated backups
- **CDN**: CloudFront or similar for static asset delivery
- **Storage**: S3 for backups (target <$50/month for 100GB)

### 10.2 Development Resources

- **Team Size**: 1-2 backend engineers, 1 frontend engineer, 1 DevOps
- **Support Load**: Estimate 10 hours/week for user support and maintenance

---

## 11. Testing & Quality Assurance

### 11.1 Testing Strategy

- **Unit Tests**: Minimum 80% coverage using pytest
- **Integration Tests**: Test API endpoints and database interactions
- **End-to-End (E2E) Tests**: Selenium/Cypress tests for critical user journeys
- **Performance Tests**: JMeter or Locust for load and stress testing
- **Security Tests**: OWASP Top 10 vulnerability scanning

### 11.2 Testing Frequency

- **Pre-deployment**: All tests must pass in CI/CD pipeline
- **Regression Testing**: Full test suite runs on every commit
- **Manual Testing**: QA team tests new features before production release

---

## 12. Documentation Requirements

### 12.1 Technical Documentation

- **API Documentation**: OpenAPI/Swagger specification with interactive docs
- **Architecture Diagram**: System architecture and deployment diagrams
- **Database Schema**: ER diagram with relationship descriptions
- **Deployment Guide**: Step-by-step setup for local development and production

### 12.2 User Documentation

- **User Manual**: Written guide for parents and healthcare professionals
- **Video Tutorials**: 3-5 minute walkthrough videos for main features
- **FAQ Section**: Common questions and troubleshooting

### 12.3 Operational Documentation

- **Runbook**: Step-by-step procedures for common operational tasks
- **Incident Response**: Plan for handling security breaches, data loss, etc.
- **Troubleshooting Guide**: Debug common issues (slow response, crashed model, etc.)

---

## 13. Environmental & Sustainability

### 13.1 Energy Efficiency

- **Code Optimization**: Minimize compute resource usage per request
- **Green Hosting**: Prefer hosting providers using renewable energy
- **Auto-scaling**: Scale down infrastructure during low-traffic periods

### 13.2 Monitoring Impact

- **Carbon Footprint**: Track and report monthly infrastructure emissions
- **Optimization Goals**: Reduce carbon per user by 10% annually

---

## Conclusion

These non-functional requirements establish quality standards, security posture, performance targets, and operational guidelines for the Mindello platform. Regular reviews and updates to these requirements ensure the system continues to meet stakeholder expectations as the platform scales and evolves.

**Document Version**: 1.0  
**Last Updated**: 2024-04-29  
**Next Review**: 2024-10-29
