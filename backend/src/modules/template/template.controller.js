import * as service from "./template.service.js";
import { successResponse } from "../../utils/apiResponse.js";

export const create = async (req, res) => {
  try {
    const data = await service.createTemplate(req.body);
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
    successResponse(res, null, "Template deleted");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};