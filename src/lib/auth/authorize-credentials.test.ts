import { describe, expect, it } from "vitest";
import {
  authorizeCredentials,
  type CredentialDependencies,
  type CredentialUser,
} from "./authorize-credentials";

const admin: CredentialUser = {
  id: 1,
  email: "administrator@example.test",
  username: "admin",
  name: "Administrator",
  password: "admin-hash",
  role: "ADMIN",
  studentId: null,
  organizationId: null,
};

const learner: CredentialUser = {
  id: 2,
  email: "learner@example.test",
  username: null,
  name: "Learner",
  password: "learner-hash",
  role: "USER",
  studentId: "S001",
  organizationId: null,
};

const orgAdmin: CredentialUser = {
  id: 3,
  email: "org@example.test",
  username: null,
  name: "Organization Administrator",
  password: "org-hash",
  role: "ORG_ADMIN",
  studentId: null,
  organizationId: 10,
};

function dependencies(users: CredentialUser[]): CredentialDependencies {
  return {
    findAdminByUsername: async (username) =>
      users.find(
        (user) => user.role === "ADMIN" && user.username === username,
      ) ?? null,
    findNonAdminByEmail: async (email) =>
      users.find(
        (user) => user.role !== "ADMIN" && user.email === email,
      ) ?? null,
    comparePassword: async (plain, hash) =>
      plain === hash.replace("-hash", "-password"),
  };
}

describe("authorizeCredentials", () => {
  it("authenticates ADMIN with a trimmed username", async () => {
    const result = await authorizeCredentials(
      { identifier: "  admin  ", password: "admin-password" },
      dependencies([admin]),
    );

    expect(result).toEqual({
      id: "1",
      email: "administrator@example.test",
      name: "Administrator",
      role: "ADMIN",
      studentId: null,
      organizationId: null,
    });
  });

  it("rejects ADMIN email even when its password is correct", async () => {
    await expect(
      authorizeCredentials(
        {
          identifier: "administrator@example.test",
          password: "admin-password",
        },
        dependencies([admin]),
      ),
    ).resolves.toBeNull();
  });

  it("authenticates USER with email", async () => {
    await expect(
      authorizeCredentials(
        {
          identifier: "learner@example.test",
          password: "learner-password",
        },
        dependencies([learner]),
      ),
    ).resolves.toMatchObject({ id: "2", role: "USER" });
  });

  it("authenticates ORG_ADMIN with email", async () => {
    await expect(
      authorizeCredentials(
        { identifier: "org@example.test", password: "org-password" },
        dependencies([orgAdmin]),
      ),
    ).resolves.toMatchObject({ id: "3", role: "ORG_ADMIN" });
  });

  it("rejects an unknown identifier", async () => {
    await expect(
      authorizeCredentials(
        { identifier: "missing", password: "password" },
        dependencies([admin, learner, orgAdmin]),
      ),
    ).resolves.toBeNull();
  });

  it("rejects an incorrect password", async () => {
    await expect(
      authorizeCredentials(
        { identifier: "admin", password: "wrong" },
        dependencies([admin]),
      ),
    ).resolves.toBeNull();
  });

  it("rejects missing credentials", async () => {
    await expect(
      authorizeCredentials({}, dependencies([admin])),
    ).resolves.toBeNull();
  });
});
