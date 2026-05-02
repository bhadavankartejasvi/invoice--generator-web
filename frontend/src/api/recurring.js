import api from "./axiosClient";

export const getRecurringInvoices = () => api.get("/recurring").then((res) => res.data);
export const createRecurringInvoice = (payload) => api.post("/recurring", payload).then((res) => res.data);
export const deleteRecurringInvoice = (id) => api.delete(`/recurring/${id}`).then((res) => res.data);
