import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import prismaClientPackage from "@prisma/client/package.json";
import { describe, expect, it } from "vitest";

function readGeneratedClientVersion() {
  const generatedClient = readFileSync(
    resolve(process.cwd(), "node_modules/.prisma/client/index.js"),
    "utf8",
  );
  return generatedClient.match(/Prisma Client JS version: ([^\s*]+)/)?.[1];
}

describe("Prisma generated client", () => {
  it("matches the installed @prisma/client package", () => {
    const installedClientVersion = prismaClientPackage.version;

    expect(readGeneratedClientVersion()).toBe(installedClientVersion);
  });
});
