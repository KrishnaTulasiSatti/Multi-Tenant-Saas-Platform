import API from "./client";

export const registerTenant = (payload) =>
  API.post("/auth/register-tenant", payload);

export const loginUser = (payload) =>
  API.post("/auth/login", payload);

export const getMe = () =>
  API.get("/auth/me");
