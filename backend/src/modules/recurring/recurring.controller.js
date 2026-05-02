import * as service from "./recurring.service.js";
import { successResponse } from "../../utils/apiResponse.js";

export const create = async (req, res) => {
  try {
    const data = await service.createRecurring(req.body);
    successResponse(res, data, "Recurring invoice created");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await service.getRecurring();
    successResponse(res, data);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteRecurring(req.params.id);
    successResponse(res, null, "Recurring invoice deleted");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};