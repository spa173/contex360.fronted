# Contex360 Business Continuity Plan

## Objective
Keep the ERP available or recover it fast enough after a service interruption.

## Scope
- Authentication and session service
- Billing, inventory, accounting, third parties, and admin console
- API, database, and static frontend delivery
- Audit logs and operational evidence

## Recovery objectives
- RTO: 4 hours
- RPO: 30 minutes

## Minimum controls
- Daily automated database backups
- Monthly restore test in a non-production environment
- Monitoring for API health and authentication failures
- Incident contacts documented and easy to reach
- Recovery evidence recorded in audit logs

## Supported scenarios
- Total API outage
- Database access loss
- Critical authentication failure
- Failed production deployment

## Recovery steps
1. Confirm the incident and identify the impacted scope.
2. Isolate the problem and protect available data.
3. Restore the latest healthy service or backup.
4. Validate authentication, API, and database integrity.
5. Record the event, actions taken, and final status.
6. Run a post-incident review and update this plan if needed.

## Ownership and review
- Owner: IT and Operations
- Review cadence: every 6 months and after major changes
- Evidence: restore tests, incident records, and audit references
