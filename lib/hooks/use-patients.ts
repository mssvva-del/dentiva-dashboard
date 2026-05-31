"use client";
import { useAuth } from "@clerk/nextjs";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { patientsApi, type ListPatientsParams } from "@/lib/api/endpoints";
import { showToast } from "@/lib/toast";

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

export function usePatientDetail(patientId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["patients", "detail", patientId],
    queryFn: async () => patientsApi.detail(patientId, await getToken()),
    enabled: !!patientId,
  });
}

export function useSendRecallSms() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patientId: string) =>
      patientsApi.sendRecallSms(patientId, await getToken()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (data.sent) {
        showToast.success("Recall text sent");
      } else if (data.status === "skipped") {
        showToast.error("SMS isn't enabled yet — nothing was sent");
      } else {
        showToast.error("Couldn't send the recall text");
      }
    },
    onError: () => {
      showToast.error("Couldn't send the recall text");
    },
  });
}
