import apiClient from "../api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Vertical,
  CreateVerticalPayload,
  UpdateVerticalPayload,
  QueryFilters,
} from "@/types";

export const verticalsApi = {
  create: async (payload: CreateVerticalPayload): Promise<Vertical> => {
    const { data } = await apiClient.post<ApiResponse<Vertical>>(
      "/api/verticals",
      payload
    );
    return data.data;
  },

  list: async (
    filters?: QueryFilters
  ): Promise<PaginatedResponse<Vertical>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Vertical>>>(
      "/api/verticals",
      { params: filters }
    );
    return data.data;
  },

  get: async (id: string): Promise<Vertical> => {
    const { data } = await apiClient.get<ApiResponse<Vertical>>(
      `/api/verticals/${id}`
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: UpdateVerticalPayload
  ): Promise<Vertical> => {
    const { data } = await apiClient.put<ApiResponse<Vertical>>(
      `/api/verticals/${id}`,
      payload
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/verticals/${id}`);
  },
};
