"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

/**
 * Returns a function that fetches the current Clerk JWT for API calls.
 * Token is fetched per-request and never persisted (no PHI / token in storage).
 */
export function useApiToken() {
  const { getToken } = useAuth();
  return useCallback(async () => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken]);
}
