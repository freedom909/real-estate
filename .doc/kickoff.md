# Task Kickoff — real-estate Authorization System

## Project
real-estate (Property Management Platform)

## Task
Implement a production-ready authorization system.

The system must support:
- User authentication
- Role-based authorization
- Secure API access

## Context
- Backend: Node.js (javaScript)
- Frontend: React
- Database: MySQL / MongoDB
- Deployment: Docker
- Cloud: GCP
- AI Model: Gemini

## Requirements

### Authentication
- Email + password login
- Password hashing
- JWT-based authentication
- Token expiration & refresh support

### Authorization
- Role-based access control (RBAC)
- Roles:
  - Admin
  - Agent (Real estate staff)
  - Owner
  - Customer
- Permission checks at API layer

### Security Constraints
- No plaintext passwords
- JWT secret must be configurable
- Proper error handling
- Prevent privilege escalation

### Non-Goals (Out of Scope)
- OAuth (Google, Apple, etc.)
- UI design polish
- Multi-factor authentication

## Completion Criteria
- Auth flow clearly documented
- Backend authorization middleware implemented
- Example protected API endpoint
- Frontend login flow example
- Security considerations documented

## Instructions to Agent System

- Follow AGENT_WORKFLOW.md strictly
- Use Planner → Architect → Implementer → Reviewer → Auditor → Archivist
- Apply Node.js preset
- Apply React preset for frontend examples
- Enforce self-critique loop
- Do not skip review or audit

## Output Expectations

- Structured design documents
- Clean, maintainable code snippets
- Clear explanation of role/permission model
- Final Auditor verdict must be PASS
