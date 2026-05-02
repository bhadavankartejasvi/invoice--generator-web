import api from "./axiosClient";

export const getClients = (search = "") => api.get(`/clients${search ? `?search=${encodeURIComponent(search)}` : ""}`).then((res) => res.data);
export const createClient = (payload) => api.post("/clients", payload).then((res) => res.data);
export const updateClient = (id, payload) => api.put(`/clients/${id}`, payload).then((res) => res.data);
export const deleteClient = (id) => api.delete(`/clients/${id}`).then((res) => res.data);
