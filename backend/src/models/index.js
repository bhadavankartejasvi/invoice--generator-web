import sequelize from "../config/db.js";

import User from "./user.model.js";
import Client from "./client.model.js";
import Product from "./product.model.js";
import Template from "./template.model.js";
import Invoice from "./invoice.model.js";
import InvoiceItem from "./invoiceItem.model.js";
import AuditLog from "./auditLog.model.js";
import RecurringInvoice from "./recurringInvoice.model.js";

// RELATIONS

Invoice.belongsTo(Client, { foreignKey: "client_id" });
Invoice.belongsTo(Template, { foreignKey: "template_id" });

Invoice.hasMany(InvoiceItem, { foreignKey: "invoice_id" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoice_id" });

InvoiceItem.belongsTo(Product, { foreignKey: "product_id" });

RecurringInvoice.belongsTo(Client, { foreignKey: "client_id" });
RecurringInvoice.belongsTo(Template, { foreignKey: "template_id" });


Invoice.hasMany(InvoiceItem, {
  foreignKey: "invoice_id",
  onDelete: "CASCADE"
});

InvoiceItem.belongsTo(Invoice, {
  foreignKey: "invoice_id"
});

export {
  sequelize,
  User,
  Client,
  Product,
  Template,
  Invoice,
  InvoiceItem,
  AuditLog,
  RecurringInvoice
};