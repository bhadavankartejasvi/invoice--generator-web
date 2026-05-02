import api from "./axiosClient";

export const login = (payload) => api.post("/auth/login", payload).then((res) => res.data);
export const register = (payload) => api.post("/auth/register", payload).then((res) => res.data);
export const fetchProfile = () => api.get("/auth/profile").then((res) => res.data);
export const updateProfile = (payload) => api.put("/auth/profile", payload).then((res) => res.data);
export const forgotPassword = (payload) => api.post("/auth/forgot-password", payload).then((res) => res.data);
