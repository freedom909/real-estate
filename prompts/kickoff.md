# Task Kickoff — Existing Project Extension

## Project
real-estate (Existing Production System)

## Task
Extend the existing system by adding authorization functionality.

⚠️ This is NOT a greenfield project.
⚠️ The current system is already in production.

## Existing System Snapshot

### Backend
- Node.js (TypeScript)
- Existing REST APIs
- Existing user model exists (email, name, id)

### Frontend
- React (existing pages and routing)
- Existing login UI (basic, non-secure)

### Database
- Existing user table / collection
- No role-based authorization currently implemented

### Infrastructure
- Docker-based deployment
- Running in production

## Current Limitations (Known)
- No JWT-based authentication
- No role separation
- APIs are publicly accessible after login

## Extension Goal

Introduce **authorization** while:
- Preserving existing behavior
- Avoiding breaking changes
- Minimizing refactoring

## Modification Boundaries (CRITICAL)

You MAY:
- Add new files
- Add new middleware
- Add new fields to user model (nullable, backward-compatible)

You MUST NOT:
- Rename existing APIs
- Remove existing fields
- Change existing API responses
- Rewrite unrelated modules

## Backward Compatibility Rules

- Existing login flow must continue to work
- Existing users without roles must default to "Customer"
- Old tokens (if any) must fail gracefully

## Rollback Strategy

- New authorization must be feature-flagged
- If disabled, system must behave exactly as before
- No data migration that cannot be reversed

## Requirements

### Authorization Model
- Role-Based Access Control (RBAC)
- Roles:
  - Admin
  - Agent
  - Owner
  - Customer
  - Pending_Agent

### Role Semantics (IMPORTANT)
- Pending_Agent is a restricted transitional role
- Pending_Agent MUST have fewer permissions than Agent
- Pending_Agent MUST NOT access:
  - Listing creation
  - Contract signing
  - Transaction-related APIs
- Pending_Agent MAY:
  - Access onboarding endpoints
  - Upload verification documents
  - Read own profile only  

### Security
- Password hashing (if applicable)
- JWT with expiration
- Middleware-level permission checks

## Completion Criteria

- Existing features continue to work
- New authorization enforced on selected APIs
- Feature flag allows full rollback
- No breaking API changes

## Instructions to Agent System

- Follow AGENT_WORKFLOW.md strictly
- Treat backward compatibility as top priority
- Architect must explicitly list all non-changes
- Reviewer must search for breaking risks
- Auditor must reject if rollback is unsafe
- Enforce self-critique loop

## Output Expectations

- Change impact analysis
- Authorization design document
- Minimal diff code examples
- Auditor verdict = PASS
