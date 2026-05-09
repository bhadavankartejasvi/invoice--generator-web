import api from "./axiosClient";

export const getTemplates = () => api.get("/templates").then((res) => {
  const data = res.data;
  if (Array.isArray(data)) {
    return data.map(t => {
      if (typeof t.config === 'string') {
        try {
          t.config = JSON.parse(t.config);
        } catch {
          t.config = {};
        }
      }
      return t;
    });
  }
  return data;
});
export const createTemplate = (payload) => api.post("/templates", payload).then((res) => res.data);
export const uploadTemplateAsset = (formData) =>
  api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then((res) => res.data);
export const updateTemplate = (id, payload) => api.put("/templates/" + id, payload).then((res) => res.data);
export const deleteTemplate = (id) => api.delete("/templates/" + id).then((res) => res.data);
