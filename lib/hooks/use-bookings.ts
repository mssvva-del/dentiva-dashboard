"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { bookingsApi, type ListBookingsParams } from "@/lib/api/endpoints";
import type { Booking } from "@/lib/schemas/bookings";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import { showToast } from "@/lib/toast";

export function useBookingsList(params: ListBookingsParams = {}) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: async () => bookingsApi.list(params, await getToken()),
    refetchInterval: POLL_INTERVAL_MS,
    placeholderData: keepPreviousData,
  });
}

export function useBookingDetail(bookingId: string) {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => bookingsApi.get(bookingId, await getToken()),
    enabled: !!bookingId,
  });
}

const STATUS_TOAST: Record<Booking["status"], string> = {
  no_show: "Marked as no-show",
  completed: "Marked as completed",
  cancelled: "Appointment cancelled",
  confirmed: "Marked as confirmed",
};

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (vars: { id: string; status: Booking["status"] }) =>
      bookingsApi.updateStatus(vars.id, vars.status, await getToken()),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", vars.id] });
      // No-show / status changes feed analytics + patient roster.
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "activity"] });
      showToast.success(STATUS_TOAST[vars.status]);
    },
    onError: () => {
      showToast.error("Couldn't update appointment");
    },
  });
}
