import "server-only";

import type { ActorKind, Capability } from "@/features/auth/policy";
import { can } from "@/features/auth/policy";

export class AuthorizationError extends Error {
  constructor() {
    super("The current actor is not authorized for this operation.");
    this.name = "AuthorizationError";
  }
}

export function assertCapability(actor: ActorKind, capability: Capability): void {
  if (!can(actor, capability)) {
    throw new AuthorizationError();
  }
}
