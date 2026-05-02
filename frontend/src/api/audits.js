import api from "./axiosClient";

export const getAuditLogs = () => api.get("/audits").then((res) => res.data);
