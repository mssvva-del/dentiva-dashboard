"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import {
  dashboardApi,
  practiceApi,
  type PatchPracticeMeData,
} from "@/lib/api/endpoints";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import { showToast } from "@/lib/toast";

export function useDashboardToday() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: async () => dashboardApi.today(await getToken()),
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useDailyBriefing() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "briefing"],
    queryFn: async () => dashboardApi.briefing(await getToken()),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
    staleTime: 4 * 60 * 1000,
  });
}

export function usePracticeMe() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["practice", "me"],
    queryFn: async () => practiceApi.me(await getToken()),
  });
}

export function usePatchPracticeMe() {
  const queryClient = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (data: PatchPracticeMeData) =>
      practiceApi.patch(data, await getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice", "me"] });
      showToast.success("Settings saved");
    },
    onError: () => {
      showToast.error("Failed to save settings");
    },
  });
}
