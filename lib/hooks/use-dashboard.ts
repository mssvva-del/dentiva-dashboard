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

export function useWeeklyStats() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "weekly"],
    queryFn: async () => dashboardApi.weekly(await getToken()),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });
}

export function useCallsByHour() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "calls-by-hour"],
    queryFn: async () => dashboardApi.callsByHour(await getToken()),
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
  });
}

export function useConversionFunnel() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "conversion"],
    queryFn: async () => dashboardApi.conversion(await getToken()),
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
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

export function useDashboardROI() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "roi"],
    queryFn: async () => dashboardApi.roi(await getToken()),
    refetchInterval: 300_000, // 5 min
    staleTime: 240_000,
  });
}

export function useAppointmentActivity() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: async () => dashboardApi.activity(await getToken()),
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
  });
}

export function useEngagement() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["dashboard", "engagement"],
    queryFn: async () => dashboardApi.engagement(await getToken()),
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
  });
}
