import api from "../../api/axios";
import type {LoginPayload, LoginResponse, } from "./auth.types";

export const login = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    payload,
  );

  return response.data;
};