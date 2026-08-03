# Admin Username Login Design

## Goal

Allow accounts with the `ADMIN` role to sign in with a username instead of an email address, while preserving email-based sign-in for `USER` and `ORG_ADMIN` accounts.

## Scope

- Reuse the existing `/login` page and Credentials provider.
- Add an optional, unique `username` field to `User`.
- Assign `admin` to the single existing `ADMIN` account during the database migration.
- Keep the existing admin email stored on the user record, but do not accept it as an admin login identifier.
- Keep existing passwords unchanged.
- Redirect a successfully authenticated `ADMIN` to `/admin`.

Registration, password reset, admin authorization rules, and login rate limiting are outside this change.

## Data Model and Migration

Add `username String? @unique` to the Prisma `User` model. The field remains `NULL` for `USER` and `ORG_ADMIN` records. MySQL permits multiple `NULL` values in a unique index, while preventing duplicate non-null usernames.

The migration will:

1. Add the nullable `username` column.
2. Set `username = 'admin'` for the existing `ADMIN` record.
3. Add a unique index for `username`.

The database currently contains exactly one `ADMIN` account, so the backfill is unambiguous. If another `ADMIN` is added later, it must receive a distinct username.

## Authentication Flow

The login form will submit one identifier field and one password field.

- If the identifier matches an `ADMIN.username`, authenticate that record with bcrypt.
- Otherwise, try the identifier as an email only for `USER` or `ORG_ADMIN`.
- Never authenticate an `ADMIN` through its email address.
- Never authenticate a non-`ADMIN` account through a username.
- Trim surrounding whitespace from the identifier before lookup.
- Return the same generic error for an unknown identifier, a disallowed identifier type, or an incorrect password.

NextAuth will continue issuing the existing JWT session containing the user ID and role. Existing proxy and API authorization checks remain responsible for enforcing admin access after authentication.

## User Interface and Redirects

The existing email input on `/login` will become a text input labeled and placeholdered as “อีเมลหรือ Username”. Browser email-format validation will be removed because `admin` is not an email address.

After successful authentication:

- `ADMIN` redirects to `/admin`.
- `ORG_ADMIN` retains the current `/` redirect; changing its destination is outside this feature.
- `USER` follows a safe same-origin `callbackUrl`, falling back to `/`.

The form keeps its current loading state and generic Thai error message.

## Error Handling and Security

- Username is unique at the database layer.
- Password verification continues to use bcrypt.
- Authentication failures do not reveal whether a username or email exists.
- The callback URL must be validated as a same-origin application path before client navigation.
- Existing sessions are unaffected; the new identifier rules apply the next time credentials are submitted.

## Testing

Automated tests will cover:

- `ADMIN` succeeds with username `admin` and the correct password.
- `ADMIN` fails when using its email address.
- `USER` succeeds with email and fails with a username-like identifier.
- `ORG_ADMIN` succeeds with email and is not treated as username-based admin login.
- Incorrect passwords and unknown identifiers return the same failure result.
- Identifier whitespace is trimmed.
- Admin login redirects to `/admin`.
- Unsafe external callback URLs fall back to `/`.

Verification will include the focused automated tests, Prisma validation, TypeScript type checking, ESLint, and a production build when the local environment permits it.
