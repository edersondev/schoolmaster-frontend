# Manual UAT TODO: Administration Foundation UI

Feature: `018-administration-foundation-ui`

Status: Pending moderated UAT with five human administrators.

## Setup

- Use a non-production environment.
- Start the frontend and backend.
- Recruit five people familiar with school administration.
- Create temporary UAT accounts with permissions for all six workflows.
- Prepare independent test data or reset the environment between participants.
- Identify participants anonymously as `Admin 1` through `Admin 5`.

## Instructions for Participants

Give each participant only these goals, without step-by-step guidance:

1. Create a school.
2. Create a user.
3. Create a role.
4. Create an academic year.
5. Create an academic period.
6. Create a guardian.

Do not intervene unless the participant becomes blocked. Record every
intervention.

## Results

Use `Pass` only when the participant completes the workflow on the first
attempt without guidance. Use `Guided` when facilitator intervention is
required. Use `Fail` when the workflow cannot be completed.

| Participant | School | User | Role | Academic year | Academic period | Guardian | Unguided total |
|-------------|--------|------|------|---------------|-----------------|----------|----------------|
| Admin 1     |        |      |      |               |                 |          | /6             |
| Admin 2     |        |      |      |               |                 |          | /6             |
| Admin 3     |        |      |      |               |                 |          | /6             |
| Admin 4     |        |      |      |               |                 |          | /6             |
| Admin 5     |        |      |      |               |                 |          | /6             |
| **Total**   |        |      |      |               |                 |          | **/30**        |

## Observation Notes

For each `Guided` or `Fail` result, record:

- Participant label
- Workflow
- Completion time
- Point of confusion or failure
- Intervention provided
- Suggested UI improvement

## Acceptance Criteria

- Pass when at least 27 of 30 workflows are completed on the first attempt
  without facilitator guidance.
- If fewer than 27 pass, address recurring usability issues and repeat affected
  workflows with representative administrators.

## After Testing

- Record results in
  `specs/specs/018-administration-foundation-ui/quickstart.md`.
- Mark task T097 complete when the acceptance criteria pass.
- Update roadmap item 4 to `Complete`.
- Mark task T098 complete.
- Revoke temporary accounts and remove disposable test data.

