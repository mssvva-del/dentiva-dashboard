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
