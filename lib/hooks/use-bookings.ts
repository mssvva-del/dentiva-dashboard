"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { bookingsApi, type ListBookingsParams } from "@/lib/api/endpoints";
import { POLL_INTERVAL_MS } from "@/lib/constants";

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
