<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Template principle slot 1 -> I. Specification-First Delivery
  - Template principle slot 2 -> II. API-First Contract Integrity
  - Template principle slot 3 -> III. Repository Boundary Discipline
  - Template principle slot 4 -> IV. Verification Before Merge
  - Template principle slot 5 -> V. Security and Tenant Safety
- Added sections:
  - Technology and Delivery Constraints
  - Workflow and Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ /home/ederson/workspace/schoolmaster/schoolmaster-frontend/.specify/templates/plan-template.md
  - ✅ /home/ederson/workspace/schoolmaster/schoolmaster-frontend/.specify/templates/spec-template.md
  - ✅ /home/ederson/workspace/schoolmaster/schoolmaster-frontend/.specify/templates/tasks-template.md
  - ✅ /home/ederson/workspace/schoolmaster/schoolmaster-frontend/README.md
- Follow-up TODOs:
  - None
-->

# Schoolmaster Frontend Specification Constitution

## Core Principles

### I. Specification-First Delivery
Every material feature change MUST begin in specification artifacts before
implementation. `spec.md` defines the requirement baseline, `plan.md` defines
the approved technical approach, `tasks.md` defines the executable work, and
implementation MUST not outrun those documents. Engineers MUST not invent
requirements, undocumented flows, or unsupported business rules. When behavior
changes, the relevant specification, plan, tasks, and quickstart artifacts MUST
be updated in the same delivery stream.

### II. API-First Contract Integrity
OpenAPI and documented contracts are the source of truth for frontend/backend
integration. Frontend work MUST consume only approved, documented operations,
payloads, headers, and error semantics. Backend or frontend behavior that
changes a contract MUST update `specs/api/openapi.yaml` and any affected
contract artifacts before implementation is considered complete. Undocumented
API consumption, frontend-local contract drift, and route aliases without spec
approval are prohibited.

### III. Repository Boundary Discipline
This repository owns specifications, contracts, decisions, diagrams, and
implementation constraints. It does not own runtime frontend or backend feature
code. Plans and tasks MUST identify the target implementation repository and
must preserve clear ownership boundaries between specification work and runtime
delivery. Cross-repository features MUST document sequencing explicitly so
frontend, backend, and contract changes can be executed without ambiguity.

### IV. Verification Before Merge
Every feature plan MUST define how correctness will be verified, and every task
set MUST include the verification work needed for the affected surface. For
Laravel-backed behavior this means Feature and Unit coverage where applicable;
for Vue 3 SPA behavior this means service, store, composable, route, or
component tests where the feature changes those boundaries. Contract validation,
spec checklist completion, and implementation-specific test execution MUST be
recorded before work is treated as complete. If a test or validation step is
deferred, the deferment MUST be explicit in the artifact and justified.

### V. Security and Tenant Safety
Authentication, authorization, tenant scoping, and data-handling rules are
non-negotiable. Features MUST validate backend inputs, protect routes with the
correct middleware or guard behavior, preserve tenant-by-column boundaries, and
avoid exposing secrets or sensitive identifiers in code, docs, or UI states.
Frontend flows MUST not infer tenant access client-side, and specification work
MUST call out any intentional cross-tenant or privileged-access path. Security
guidance in specs MUST follow OWASP fundamentals and remain aligned with the
published contract behavior.

## Technology and Delivery Constraints

The approved delivery stack is Laravel API backend plus Vue 3 SPA frontend with
Composition API, Pinia, Axios service boundaries, Element Plus, and Tailwind
CSS. Architecture work MUST keep controllers thin, place business logic in
services, use Requests for validation and Resources for API output on backend
surfaces, and keep frontend API logic out of pages and presentation components.
Reusable patterns defined in repository guidance, including service layers,
DTOs for complex input, repository use for complex data access, exception-based
flow, and API Resources, MUST be followed unless a feature plan documents and
justifies an exception.

## Workflow and Quality Gates

Work MUST follow this order:

1. Read relevant specifications, docs, and ADRs before editing anything.
2. Update or create the feature specification.
3. Update the implementation plan and task list as required.
4. Update OpenAPI and supporting contracts when behavior or payloads change.
5. Deliver runtime implementation in the target repository only after the above
   artifacts are aligned.
6. Run the relevant validation steps and record the outcome.

Quality gates for any feature are:

1. Spec artifacts are complete and contain no unresolved clarification markers.
2. Constitution check in `plan.md` passes or documents approved exceptions.
3. Tasks trace to user stories, requirements, and contract boundaries.
4. OpenAPI matches the intended behavior for any affected integration.
5. Required tests, checklists, and validation commands have been executed or
   explicitly deferred with rationale.

## Governance

This constitution overrides conflicting informal practice for work in this
repository. Changes to it MUST be made through a documented update that
explains the rationale, records a semantic version bump, and reviews dependent
templates and guidance files for consistency. Versioning policy is:

- MAJOR: Removes or redefines a core principle in a backward-incompatible way.
- MINOR: Adds a principle, section, or materially stronger governance rule.
- PATCH: Clarifies wording without changing governance meaning.

Compliance review MUST happen during planning and again before implementation is
considered complete. Any exception to these rules MUST be documented in the
feature plan’s Constitution Check and justified with a simpler rejected
alternative. Runtime engineering guidance is anchored in `AGENTS.md`,
`specs/AGENTS.md`, and the active feature artifacts under `specs/specs/`.

**Version**: 1.0.0 | **Ratified**: 2026-06-23 | **Last Amended**: 2026-06-23
