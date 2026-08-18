"use client";

import type { ReactNode } from "react";
import { useCan, useIsInternal } from "@/lib/hooks/use-me";
import { useAdminMe } from "@/lib/hooks/use-admin";
import type { Permission } from "@/lib/schemas/me";
import { LoadingState } from "@/components/features/page-states";

/**
 * Element-level permission gate (Platform Iter 1, RBAC).
 *
 * Wrap any control the user may not be allowed to use:
 *
 *   <Can permission={PERM.MANAGE_BILLING}>
 *     <Button>Update plan</Button>
 *   </Can>
 *
 * Renders children only when the signed-in user holds `permission` (resolved
 * server-side via GET /api/me). While permissions are loading it renders
 * nothing by default (fail closed — no flash of a forbidden control). Pass
 * `fallback` to show something to users who lack the permission.
 *
 * This is UX only. The matching API endpoint re-checks the permission
 * server-side, so hiding the button is convenience, not the security boundary.
 */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { allowed, pending } = useCan(permission);
  if (pending) return null; // don't flash either branch until we know
  return <>{allowed ? children : fallback}</>;
}

/**
 * Route-level permission guard. Use at the top of a page that requires a
 * specific clinic permission; it shows a loader while resolving, the page when
 * allowed, and an access-denied notice otherwise.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { allowed, pending } = useCan(permission);
  if (pending) return <LoadingState label="Checking access…" />;
  if (!allowed) return <AccessDenied />;
  return <>{children}</>;
}

/**
 * /admin route guard — only Dentovox-internal staff may enter the admin tree.
 * Clinic users (owners included) are denied. This mirrors the backend
 * require_internal() gate; the server still enforces it on every /admin/* call.
 */
export function RequireInternal({ children }: { children: ReactNode }) {
  const { isInternal, pending } = useIsInternal();
  if (pending) return <LoadingState label="Checking access…" />;
  if (!isInternal) return <AccessDenied />;
  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <p className="text-lg font-semibold text-foreground">Access restricted</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        You don&apos;t have permission to view this page. If you think this is a
        mistake, ask your practice owner or a Dentovox administrator.
      </p>
    </div>
  );
}

/**
 * Element-level gate for ADMIN controls.
 *
 * `Can` reads the CLINIC permission set; internal staff carry a different one
 * (ADMIN_ROLE_PERMISSIONS server-side), so admin screens were ungated — a
 * support or sales operator saw Approve, Override subscription, Edit profile
 * and PMS Connect fully rendered, and got a 403 on click. A control that looks
 * available and refuses is worse than one that is absent: it reads as a broken
 * product rather than a permission they do not hold.
 *
 * UX only. Every one of those endpoints re-checks server-side — this hides the
 * button, it does not guard the door.
 */
export function CanAdmin({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { data: me } = useAdminMe();
  // Nothing until we know. Rendering optimistically would flash a control the
  // operator is about to lose, which is how you teach someone to click fast.
  if (me === undefined) return null;
  return <>{me.permissions.includes(permission) ? children : fallback}</>;
}
