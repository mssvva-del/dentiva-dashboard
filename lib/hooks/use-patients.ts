"use client";
import { useAuth } from "@clerk/nextjs";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { patientsApi, type ListPatientsParams } from "@/lib/api/endpoints";

export function usePatientRecall(threshold = 6, limit = 10) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["patients", "recall", threshold, limit],
    queryFn: async () => {
      const token = await getToken();
      return patientsApi.recall(threshold, limit, token);
    },
    refetchInterval: 600_000, // 10 min — recall list doesn't change often
    staleTime: 540_000,
  });
}

export function usePatientsList(params: ListPatientsParams = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["patients", "list", params],
    queryFn: async () => {
      const token = await getToken();
      return patientsApi.list(params, token);
    },
    refetchInterval: 600_000,
    placeholderData: keepPreviousData,
  });
}
