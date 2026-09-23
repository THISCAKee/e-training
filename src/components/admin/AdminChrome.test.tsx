import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminBrand, AdminProfile } from "./AdminChrome";

describe("admin chrome", () => {
  it("links the admin brand back to the home page", () => {
    const markup = renderToStaticMarkup(<AdminBrand />);

    expect(markup).toContain('href="/"');
    expect(markup).toContain("MSU");
    expect(markup).toContain("e-Training");
  });

  it("renders a readable profile identity", () => {
    const markup = renderToStaticMarkup(
      <AdminProfile displayName="Admin" isOrgAdmin={false} />,
    );

    expect(markup).toContain(">A<");
    expect(markup).toContain(">Admin<");
    expect(markup).toContain("Administrator");
    expect(markup).not.toContain("displayName.slice");
  });
});
