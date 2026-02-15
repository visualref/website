import apiClient from "@/lib/api-client";
import { Distribution, CreateDistributionPayload, UpdateDistributionPayload, ApiResponse, PaginatedResponse } from "@/types";

export const distributionsApi = {
  create: async (data: CreateDistributionPayload): Promise<ApiResponse<Distribution>> => {
    const response = await apiClient.post("/api/distributions", data);
    return response.data;
  },

  list: async (params?: { page?: number; limit?: number; search?: string; content_item_id?: string }): Promise<PaginatedResponse<Distribution>> => {
    const response = await apiClient.get("/api/distributions", { params });
    return response.data.data;
  },

  get: async (id: string): Promise<ApiResponse<Distribution>> => {
    const response = await apiClient.get(`/api/distributions/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateDistributionPayload): Promise<ApiResponse<Distribution>> => {
    const response = await apiClient.patch(`/api/distributions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/distributions/${id}`);
    return response.data;
  },
};
