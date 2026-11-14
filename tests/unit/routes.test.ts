import { describe, expect, it } from "vitest";

import { isReservedCitySlug, permanentRedirects, routeRegistry } from "../../src/config/routes";

describe("canonical route registry", () => {
  it("contains every admin parent and record route", () => {
    expect(routeRegistry.admin).toEqual(
      expect.arrayContaining([
        "/admin/entities",
        "/admin/entities/[id]",
        "/admin/payments",
        "/admin/payments/[id]",
        "/admin/cities",
        "/admin/cities/[id]",
        "/admin/support",
        "/admin/support/[id]",
        "/admin/team",
        "/admin/team/[id]",
      ]),
    );
  });

  it("reserves static route words from city slugs", () => {
    expect(isReservedCitySlug(" Admin ")).toBe(true);
    expect(isReservedCitySlug("indore")).toBe(false);
  });

  it("keeps the approved permanent redirects", () => {
    expect(permanentRedirects).toContainEqual({ source: "/faq", destination: "/help" });
    expect(permanentRedirects).toContainEqual({
      source: "/contact",
      destination: "/help?intent=report",
    });
  });
});
