import * as service from "./product.service.js";
import { successResponse } from "../../utils/apiResponse.js";

export const create = async (req, res) => {
  try {
    const data = await service.createProduct(req.body);
    successResponse(res, data, "Product created");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await service.getProducts(req.query);
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
    await service.updateProduct(req.params.id, req.body);
    successResponse(res, null, "Product updated");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteProduct(req.params.id);
    successResponse(res, null, "Product deleted");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};