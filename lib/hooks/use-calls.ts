"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { callsApi, type ListCallsParams } from "@/lib/api/endpoints";
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
