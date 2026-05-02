import AuditLog from "../../models/auditLog.model.js";

export const logAction = (data) => AuditLog.create(data);

export const getLogs = () => AuditLog.findAll();