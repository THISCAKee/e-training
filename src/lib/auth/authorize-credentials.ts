export type UserRole = "USER" | "ADMIN" | "ORG_ADMIN";

export interface CredentialUser {
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  password: string;
  role: UserRole;
  studentId: string | null;
  organizationId: number | null;
}

export interface CredentialDependencies {
  findAdminByUsername(username: string): Promise<CredentialUser | null>;
  findNonAdminByEmail(email: string): Promise<CredentialUser | null>;
  comparePassword(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean>;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  studentId: string | null;
  organizationId: number | null;
}

export async function authorizeCredentials(
  credentials: { identifier?: string; password?: string },
  dependencies: CredentialDependencies,
): Promise<AuthorizedUser | null> {
  const identifier = credentials.identifier?.trim();
  const password = credentials.password;

  if (!identifier || !password) return null;

  const user =
    (await dependencies.findAdminByUsername(identifier)) ??
    (await dependencies.findNonAdminByEmail(identifier));

  if (!user) return null;

  const isPasswordMatch = await dependencies.comparePassword(
    password,
    user.password,
  );

  if (!isPasswordMatch) return null;

  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    studentId: user.studentId,
    organizationId: user.organizationId,
  };
}
