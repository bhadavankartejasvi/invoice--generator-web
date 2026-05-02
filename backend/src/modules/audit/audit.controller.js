import { getLogs } from "./audit.service.js";

export const getAll = async (req, res) => {
  const data = await getLogs();
  res.json(data);
};