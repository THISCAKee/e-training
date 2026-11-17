import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import PerspectiveTunnelHero from "./perspective-tunnel-hero";

it("presents the learning message without the start learning button", () => {
  const html = renderToStaticMarkup(<PerspectiveTunnelHero courses={[{ id: 1, title: "คอร์ส AI", imageUrl: "/course.jpg" }]} />);
  expect(html).toContain("พลิกโฉมการเรียนรู้");
  expect(html).not.toContain("เริ่มเรียนเลย");
  expect(html).toContain("opacity:0");
  expect(html).not.toContain("คลิกเพื่อสำรวจ");
});

