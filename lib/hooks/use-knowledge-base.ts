"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "./use-api-token";
import { knowledgeBaseApi } from "@/lib/api/endpoints";
import type { KnowledgeBase } from "@/lib/schemas/knowledge-base";
import { showToast } from "@/lib/toast";

export function useKnowledgeBase() {
  const getToken = useApiToken();
  return useQuery({
    queryKey: ["knowledge-base"],
    queryFn: async () => knowledgeBaseApi.get(await getToken()),
  });
}

export function useSaveKnowledgeBase() {
  const queryClient = useQueryClient();
  const getToken = useApiToken();
  return useMutation({
    mutationFn: async (kb: KnowledgeBase) =>
      knowledgeBaseApi.put(kb, await getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      showToast.success("Knowledge base saved");
    },
    onError: () => {
      showToast.error("Couldn't save knowledge base");
    },
  });
}
