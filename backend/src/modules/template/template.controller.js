import * as service from "./template.service.js";
import { successResponse } from "../../utils/apiResponse.js";
import { logAction } from "../audit/audit.service.js";

export const create = async (req, res) => {
  try {
    const data = await service.createTemplate(req.body);
    await logAction({ user_id: req.user?.id || 1, action: "Created Template", entity: "Template", entity_id: data.id, details: { name: data.name } });
    successResponse(res, data, "Template created");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await service.getTemplates();
    successResponse(res, data);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const update = async (req, res) => {
  try {
    await service.updateTemplate(req.params.id, req.body);
    await logAction({ user_id: req.user?.id || 1, action: "Updated Template", entity: "Template", entity_id: req.params.id });
    successResponse(res, null, "Template updated");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteTemplate(req.params.id);
    await logAction({ user_id: req.user?.id || 1, action: "Deleted Template", entity: "Template", entity_id: req.params.id });
    successResponse(res, null, "Template deleted");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};