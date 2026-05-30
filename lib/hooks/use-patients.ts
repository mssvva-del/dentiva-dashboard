"use client";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { patientsApi } from "@/lib/api/endpoints";

export function usePatientRecall() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["patients", "recall"],
    queryFn: async () => {
      const token = await getToken();
      return patientsApi.recall(6, 10, token);
    },
    refetchInterval: 600_000, // 10 min — recall list doesn't change often
    staleTime: 540_000,
  });
}
