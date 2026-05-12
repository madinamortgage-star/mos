"use server";

/**
 * Organization Server Actions.
 *
 * Currently just the placeholder org switcher: persist the chosen org id in a
 * cookie. The layout resolves it against the user's real memberships, so a
 * stale/forged cookie just falls back to the first membership.
 */

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACTIVE_ORG_COOKIE } from "@/lib/org";

export async function setActiveOrgAction(orgId: string): Promise<void> {
  // TODO(prod): verify the caller is actually a member of `orgId` before
  // storing it (defence-in-depth — `resolveCurrentOrg` already won't echo a
  // non-member org back as "current", but don't even persist it).
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
