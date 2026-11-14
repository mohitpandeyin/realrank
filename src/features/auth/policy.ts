export type ActorKind = "anonymous" | "owner" | "reviewer" | "finance" | "administrator" | "system";

export type Capability =
  | "public:read"
  | "checkout:create"
  | "own-entity:manage"
  | "own-payment:read"
  | "own-support:manage"
  | "moderation:manage"
  | "payment:reconcile"
  | "support:manage"
  | "staff:manage"
  | "fulfilment:execute";

const capabilities: Record<ActorKind, ReadonlySet<Capability>> = {
  anonymous: new Set(["public:read", "checkout:create"]),
  owner: new Set([
    "public:read",
    "checkout:create",
    "own-entity:manage",
    "own-payment:read",
    "own-support:manage",
  ]),
  reviewer: new Set(["public:read", "moderation:manage", "support:manage"]),
  finance: new Set(["public:read", "payment:reconcile", "support:manage"]),
  administrator: new Set([
    "public:read",
    "moderation:manage",
    "payment:reconcile",
    "support:manage",
    "staff:manage",
  ]),
  system: new Set(["fulfilment:execute"]),
};

export function can(actor: ActorKind, capability: Capability): boolean {
  return capabilities[actor].has(capability);
}
