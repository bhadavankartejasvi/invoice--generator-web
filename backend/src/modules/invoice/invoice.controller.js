import * as service from "./invoice.service.js";
import { successResponse } from "../../utils/apiResponse.js";
import { generateInvoicePDF } from "./pdf.service.js";
import { sendInvoiceEmail } from "../notification/email.service.js";
import { Invoice, InvoiceItem, Client, Template } from "../../models/index.js";
import { logAction } from "../audit/audit.service.js";

// CREATE
export const create = async (req, res) => {
  try {
    const data = await service.createInvoice(req.body);
    await logAction({ user_id: req.user?.id || 1, action: "Created Invoice", entity: "Invoice", entity_id: data.id, details: { invoice_number: data.invoice_number } });
    successResponse(res, data, "Invoice created");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// GET ALL
export const getAll = async (req, res) => {
  try {
    const data = await service.getInvoices(req.query);
    successResponse(res, data);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// GET BY ID
export const getById = async (req, res) => {
  try {
    const data = await service.getInvoiceById(req.params.id);
    successResponse(res, data);
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message
    });
  }
};

// UPDATE
export const update = async (req, res) => {
  try {
    const data = await service.updateInvoice(req.params.id, req.body);
    await logAction({ user_id: req.user?.id || 1, action: "Updated Invoice", entity: "Invoice", entity_id: data.id });
    successResponse(res, data, "Invoice updated");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// STATUS UPDATE
export const updateStatus = async (req, res) => {
  try {
    const data = await service.updateStatus(
      req.params.id,
      req.body.status,
      req.user?.id
    );
    await logAction({ user_id: req.user?.id || 1, action: `Status updated to ${req.body.status}`, entity: "Invoice", entity_id: data.id });
    successResponse(res, data, "Status updated");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// DOWNLOAD PDF ✅
export const downloadPDF = async (req, res) => {
  try {
    const id = req.params.id;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    const items = await InvoiceItem.findAll({ where: { invoice_id: id } });
    const client = await Client.findByPk(invoice.client_id);
    const template = await Template.findByPk(invoice.template_id);

    const filePath = await generateInvoicePDF(invoice, items, client, template);

    res.download(filePath);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// SEND EMAIL ✅
export const sendInvoice = async (req, res) => {
  try {
    const id = req.params.id;
    const { email } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    const items = await InvoiceItem.findAll({ where: { invoice_id: id } });
    const client = await Client.findByPk(invoice.client_id);
    const template = await Template.findByPk(invoice.template_id);

    const filePath = await generateInvoicePDF(invoice, items, client, template);

    await sendInvoiceEmail(email, filePath);

    successResponse(res, null, "Invoice emailed successfully");
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// DELETE
export const remove = async (req, res) => {
  try {
    await service.deleteInvoice(req.params.id);
    await logAction({ user_id: req.user?.id || 1, action: "Deleted Invoice", entity: "Invoice", entity_id: req.params.id });
    successResponse(res, null, "Invoice deleted");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};