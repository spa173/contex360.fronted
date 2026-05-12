# Contex360 Access Review Procedure

## Goal
Ensure that access stays aligned with active users, roles, and business needs.

## Frequency
- Monthly automated review on the first day of each month at 08:00 America/Bogota
- Manual review after onboarding, offboarding, or role changes
- Extra review after a security incident or a major tenant change

## Data reviewed
- User status
- Memberships per tenant
- Two-factor authentication state
- Active and revoked sessions
- Users without recent activity

## Review steps
1. Open the admin console and run the access review.
2. Check inactive users that still have memberships.
3. Confirm whether privileged users have 2FA enabled.
4. Review stale sessions and close the ones that are no longer needed.
5. Record the outcome in the audit log.
6. Document exceptions with an approval owner and a follow-up date.

## Acceptance criteria
- No inactive user should keep active access without approval.
- Privileged users should have 2FA enabled.
- Stale sessions should be reviewed and closed when not needed.
- Exceptions should be documented and tracked until resolved.
