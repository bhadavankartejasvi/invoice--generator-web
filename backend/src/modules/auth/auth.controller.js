import * as service from "./auth.service.js";
import { logAction } from "../audit/audit.service.js";

export const register = async (req, res) => {
  try {
    const user = await service.registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const token = await service.loginUser(req.body);
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    await logAction({ user_id: decoded.id, action: "Logged in", entity: "Auth", entity_id: decoded.id });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await service.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await service.updateProfile(req.user.id, req.body);
    await logAction({ user_id: req.user.id, action: "Updated Profile", entity: "User", entity_id: req.user.id });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const response = await service.forgotPassword(req.body.email);
    res.json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};