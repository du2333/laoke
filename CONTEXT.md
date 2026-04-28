# Laoke

Laoke is a meeting application for joining recent meetings and managing meetings through an admin flow.

## Language

**Meeting**:
A joinable conversation space identified by a meeting ID.

**Admin Mode**:
The privileged user state entered only after the server accepts the admin password.

**Admin Password Verification**:
The check that must succeed before a user enters **Admin Mode**.

**Delete Meeting**:
A user-facing admin action that removes a meeting from the active management list.
_Avoid_: Deactivate meeting

## Relationships

- **Admin Mode** allows an admin to create and **Delete Meeting** entries.
- A **Meeting** can appear in the active management list until it is deleted.
- **Admin Password Verification** gates entry into **Admin Mode**.

## Example Dialogue

> **Dev:** "Should the admin button say deactivate meeting?"
> **Domain expert:** "No — from the admin's point of view, they delete the meeting because it disappears from the list."

## Flagged Ambiguities

- "Deactivate meeting" describes an implementation-level status change, but the product language is **Delete Meeting**.
- Entering **Admin Mode** requires server acceptance of the admin password; locally storing a password is not enough.
