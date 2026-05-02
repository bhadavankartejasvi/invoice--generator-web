import api from "./axiosClient";

export const getProducts = (search = "") => api.get(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`).then((res) => res.data);
export const createProduct = (payload) => api.post("/products", payload).then((res) => res.data);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((res) => res.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((res) => res.data);
