"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { reactivationApi } from "@/lib/api/endpoints";

/** Reactivation Engine ROI — funnel + recovered revenue for the current practice. */
export function useReactivationRoi() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["reactivation", "roi"],
    queryFn: async () => reactivationApi.roi(await getToken()),
    refetchInterval: 300_000, // 5 min
    staleTime: 240_000,
  });
}
