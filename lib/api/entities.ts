import apiClient from "@/lib/api-client";
import { Entity, CreateEntityPayload, UpdateEntityPayload, ApiResponse, PaginatedResponse } from "@/types";

export const entitiesApi = {
  create: async (data: CreateEntityPayload): Promise<ApiResponse<Entity>> => {
    const response = await apiClient.post("/api/entities", data);
    return response.data;
  },

  getAll: async (params?: { page?: number; limit?: number; search?: string; workspace_id?: string }): Promise<PaginatedResponse<Entity>> => {
    const response = await apiClient.get("/api/entities", { params });
    return response.data.data;
  },

  getOne: async (id: string): Promise<ApiResponse<Entity>> => {
    const response = await apiClient.get(`/api/entities/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateEntityPayload): Promise<ApiResponse<Entity>> => {
    const response = await apiClient.patch(`/api/entities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/entities/${id}`);
    return response.data;
  },
};
