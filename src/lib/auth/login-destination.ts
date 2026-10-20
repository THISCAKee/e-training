export function getLoginDestination(
  role: string | undefined,
  callbackUrl: string,
  needsFaculty = false,
): string {
  if (role === "ADMIN") return "/admin";
  if (role === "ORG_ADMIN") return "/";

  const isSafeApplicationPath =
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    callbackUrl !== "/login" &&
    !callbackUrl.startsWith("/login?");

  const destination = isSafeApplicationPath ? callbackUrl : "/";

  return needsFaculty
    ? `/complete-profile?callbackUrl=${encodeURIComponent(destination)}`
    : destination;
}
