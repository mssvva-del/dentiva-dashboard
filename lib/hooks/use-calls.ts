"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { callsApi, activeCallsApi, type ListCallsParams, type ActiveCallSummary } from "@/lib/api/endpoints";
export type { ActiveCallSummary };
import { POLL_INTERVAL_MS } from "@/lib/constants";

export function useCallsList(params: ListCallsParams = {}) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["calls", params],
    queryFn: async () => callsApi.list(params, await getToken()),
    refetchInterval: POLL_INTERVAL_MS,
    placeholderData: keepPreviousData,
  });
}

export function useCallDetail(callId: string) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["calls", callId],
    queryFn: async () => callsApi.get(callId, await getToken()),
    enabled: Boolean(callId),
  });
}

export function useActiveCalls() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["calls", "active"],
    queryFn: async () => activeCallsApi.get(await getToken()),
    refetchInterval: 3000,
    staleTime: 0,
  });
}
