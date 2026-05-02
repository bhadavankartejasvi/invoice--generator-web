import api from "./axiosClient";

export const getTemplates = () => api.get("/templates").then((res) => res.data);
export const createTemplate = (payload) => api.post("/templates", payload).then((res) => res.data);
export const uploadTemplateAsset = (formData) =>
  api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then((res) => res.data);
export const updateTemplate = (id, payload) => api.put("/templates/" + id, payload).then((res) => res.data);
export const deleteTemplate = (id) => api.delete("/templates/" + id).then((res) => res.data);
