# Security Specification for Firestore Rules

## 1. Data Invariants
- **Loan Applications**: 
  - Submissions must have `status` set to "審批中" initially.
  - Users can read/write their own applications, but admins can read/write all applications.
  - The email verified status should block malicious writes.
  - Timestamps (`created_at`) must align with server time.
- **Loan Accounts**:
  - Read access is restricted to the owning user (`user_id == request.auth.uid`) or admins.
  - No client-side creation or updating is permitted (system-only generated once a loan is approved).
- **Site Settings**:
  - Read access is public.
  - Write access is strictly restricted to authenticated Administrators.
- **User Roles & Profiles**:
  - Public can read Profile display names.
  - Users can read and update their own Profile.
  - `user_roles` can only be set or changed by authenticated admins, never self-assigned.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Privilege Escalation**: Attempt to write `{ "role": "admin" }` to `user_roles/attacker_uid` as a non-admin.
2. **Identity Spoofing**: Submitting a loan application with `user_id` set to standard user ID when authenticated as another.
3. **Ghost Fields Injection**: Adding an unmapped field `{ "isApprovedDirectly": true }` into a custom application payload.
4. **State Shortcutting**: Creating a loan application with status set to `'已批准'` directly to bypass admin approval.
5. **PII Blanket Scraping**: Requesting all user emails and hkid numbers from `loan_applications` as an unauthenticated guest.
6. **Denial of Wallet String Poisoning**: Injecting a 2MB base64 string as an address or ID.
7. **Temporal Fraud**: Setting `created_at` timestamp in the past or future to spoof application time.
8. **Orphaned Loan Creation**: Attempting to insert a loan account directly as a standard client without an approved loan flow.
9. **Settings Hijacking**: Authenticated user trying to write over `site_settings/registration_thank_you` content.
10. **Role Spoofing via Metadata**: Modifying own user record to bypass roles check.
11. **Negative Value / Type Invalidation**: Writing a `loan_amount` of `-100000` or `"large_amount"` to bypass range validation.
12. **Status Alteration After Decision**: Attempting to update a loan application after its state has already been finalized as `'已批准'` or `'已拒絕'`.

## 3. Test Runner Design (firestore.rules)
All rule updates will be validated against active scenarios to confirm they return `PERMISSION_DENIED` on the dirty dozen.
