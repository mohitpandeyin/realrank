export const routeRegistry = {
  public: [
    "/",
    "/[city]",
    "/[city]/category/[categorySlug]",
    "/entity/[entitySlug]",
    "/entity/[entitySlug]/portfolio/[itemSlug]",
    "/help",
    "/how-it-works",
    "/ranking-policy",
    "/terms",
    "/privacy",
    "/refund-policy",
  ],
  transaction: ["/access", "/payment/status", "/onboarding"],
  owner: ["/manage", "/manage/insights"],
  admin: [
    "/admin/access",
    "/admin",
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
  ],
  api: ["/api/webhooks/razorpay", "/api/uploads/sign", "/api/analytics/capture", "/api/health"],
} as const;

export const permanentRedirects = [
  { source: "/faq", destination: "/help" },
  { source: "/contact", destination: "/help?intent=report" },
  { source: "/indore", destination: "/" },
] as const;

export const reservedCitySlugs = new Set([
  "access",
  "admin",
  "api",
  "contact",
  "entity",
  "faq",
  "help",
  "how-it-works",
  "manage",
  "onboarding",
  "payment",
  "privacy",
  "ranking-policy",
  "refund-policy",
  "terms",
]);

export function isReservedCitySlug(slug: string): boolean {
  return reservedCitySlugs.has(slug.trim().toLowerCase());
}
