"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { dashboardApi, practiceApi } from "@/lib/api/endpoints";
import { POLL_INTERVAL_MS } from "@/lib/constants";

export function useDashboardToday() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: async () => dashboardApi.today(await getToken()),
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function usePracticeMe() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["practice", "me"],
    queryFn: async () => practiceApi.me(await getToken()),
  });
}
