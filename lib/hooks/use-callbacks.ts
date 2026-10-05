"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { callbacksApi, type ListCallbacksParams } from "@/lib/api/endpoints";
import type { CallbackStatus } from "@/lib/schemas/callbacks";
import { showToast } from "@/lib/toast";

export function useCallbacksList(params: ListCallbacksParams = {}) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["callbacks", "list", params],
    queryFn: async () => callbacksApi.list(params, await getToken()),
    // Callbacks are time-sensitive — keep them fresh on the dashboard.
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateCallbackStatus() {
  const queryClient = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (vars: { id: string; status: CallbackStatus }) =>
      callbacksApi.updateStatus(vars.id, vars.status, await getToken()),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["callbacks"] });
      showToast.success(
        vars.status === "handled"
          ? "Marked as handled"
          : vars.status === "dismissed"
            ? "Callback dismissed"
            : "Callback reopened"
      );
    },
    onError: () => {
      showToast.error("Couldn't update callback");
    },
  });
}

// What the backend answered, in words a front desk can act on.
const AI_CALL_MESSAGES: Record<string, string> = {
  placed: "Calling now — the result will appear in Calls",
  outside_hours: "Outside calling hours (9:00–19:30 clinic time)",
  already_tried: "The AI has already called this patient",
  no_phone: "This request has no valid phone number",
  not_pending: "This callback is no longer open",
  not_configured: "AI calling isn't set up for this clinic yet",
  failed: "The call couldn't be started — please call the patient yourself",
};

export function useAiCallback() {
  const queryClient = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (id: string) =>
      callbacksApi.aiCall(id, await getToken()),
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ["callbacks"] });
      const message = AI_CALL_MESSAGES[status] ?? "Couldn't start the call";
      if (status === "placed") showToast.success(message);
      else showToast.info(message);
    },
    onError: () => {
      showToast.error("Couldn't start the call");
    },
  });
}
