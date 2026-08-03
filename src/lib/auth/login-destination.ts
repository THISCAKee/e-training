export function getLoginDestination(
  role: string | undefined,
  callbackUrl: string,
): string {
  if (role === "ADMIN") return "/admin";
  if (role === "ORG_ADMIN") return "/";

  const isSafeApplicationPath =
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    callbackUrl !== "/login" &&
    !callbackUrl.startsWith("/login?");

  return isSafeApplicationPath ? callbackUrl : "/";
}
