"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { waitlistApi, type ListWaitlistParams } from "@/lib/api/endpoints";
import type { WaitlistStatus } from "@/lib/schemas/waitlist";
import { showToast } from "@/lib/toast";

export function useWaitlistList(params: ListWaitlistParams = {}) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["waitlist", "list", params],
    queryFn: async () => waitlistApi.list(params, await getToken()),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateWaitlistStatus() {
  const queryClient = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (vars: { id: string; status: WaitlistStatus }) =>
      waitlistApi.updateStatus(vars.id, vars.status, await getToken()),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      showToast.success(
        vars.status === "booked"
          ? "Marked as booked"
          : vars.status === "removed"
            ? "Removed from waitlist"
            : vars.status === "notified"
              ? "Marked as notified"
              : "Back on the waitlist"
      );
    },
    onError: () => {
      showToast.error("Couldn't update waitlist entry");
    },
  });
}
