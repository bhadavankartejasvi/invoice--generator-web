import * as service from "./client.service.js";
import { successResponse } from "../../utils/apiResponse.js";

export const create = async (req, res) => {
  try {
    const data = await service.createClient(req.body);
    successResponse(res, data, "Client created");
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists"
      });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: err.errors[0].message
      });
    }

    res.status(400).json({
      success: false,
      message: err.message || "Failed to create client"
    });
  }
};

export const getAll = async (req, res) => {
  const data = await service.getClients(req.query);
  successResponse(res, data);
};

export const getOne = async (req, res) => {
  const data = await service.getClientById(req.params.id);
  successResponse(res, data);
};

export const update = async (req, res) => {
  try {
    const data = await service.updateClient(req.params.id, req.body);
    successResponse(res, data, "Client updated");
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "A client with this email already exists"
      });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: err.errors[0].message
      });
    }

    res.status(400).json({
      success: false,
      message: err.message || "Failed to update client"
    });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteClient(req.params.id);
    successResponse(res, null, "Client deleted");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};