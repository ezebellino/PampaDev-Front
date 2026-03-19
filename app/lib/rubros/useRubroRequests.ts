import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRubroRequest,
  listRubroRequests,
  reviewRubroRequest,
  subscribeToRubroRequests,
  type CreateRubroRequestInput,
  type RubroRequest,
} from "./rubroRequests";

export const RUBRO_REQUESTS_QUERY_KEY = ["rubro-requests"] as const;

export function useRubroRequests() {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: RUBRO_REQUESTS_QUERY_KEY,
    queryFn: async () => listRubroRequests(),
    staleTime: Infinity,
  });

  useEffect(() => {
    return subscribeToRubroRequests(() => {
      queryClient.invalidateQueries({ queryKey: RUBRO_REQUESTS_QUERY_KEY });
    });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async (payload: CreateRubroRequestInput) => createRubroRequest(payload),
    onSuccess: (createdRequest) => {
      queryClient.setQueryData<RubroRequest[]>(RUBRO_REQUESTS_QUERY_KEY, (current = []) => [createdRequest, ...current]);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (
      payload: {
        id: string;
        status: "approved" | "rejected";
        devNotes?: string;
        reviewedBy?: string;
      }
    ) => reviewRubroRequest(payload.id, payload.status, payload),
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData<RubroRequest[]>(RUBRO_REQUESTS_QUERY_KEY, (current = []) =>
        current.map((request) => (request.id === updatedRequest.id ? updatedRequest : request))
      );
    },
  });

  return {
    requests: requestsQuery.data ?? [],
    loading: requestsQuery.isLoading,
    error: requestsQuery.error,
    createRequest: (payload: CreateRubroRequestInput) => createMutation.mutateAsync(payload),
    approve: (id: string, devNotes?: string, reviewedBy?: string) =>
      reviewMutation.mutateAsync({ id, status: "approved", devNotes, reviewedBy }),
    reject: (id: string, devNotes?: string, reviewedBy?: string) =>
      reviewMutation.mutateAsync({ id, status: "rejected", devNotes, reviewedBy }),
    creating: createMutation.isPending,
    reviewing: reviewMutation.isPending,
  };
}