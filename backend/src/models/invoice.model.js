import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Invoice = sequelize.define(
  "Invoice",
  {
    invoice_number: {
      type: DataTypes.STRING,
      unique: true
    },

    status: {
      type: DataTypes.ENUM("draft", "finalised", "paid", "cancelled"),
      defaultValue: "draft"
    },

    issue_date: DataTypes.DATE,
    due_date: DataTypes.DATE,

    customer_name: DataTypes.STRING,
    customer_email: DataTypes.STRING,
    customer_phone: DataTypes.STRING,

    billing_address: DataTypes.TEXT,
    shipping_address: DataTypes.TEXT,

    subtotal: DataTypes.DECIMAL,
    tax_rate: DataTypes.DECIMAL,
    tax_amount: DataTypes.DECIMAL,
    discount_amount: DataTypes.DECIMAL,
    total_amount: DataTypes.DECIMAL,

    currency: DataTypes.STRING,
    notes: DataTypes.TEXT,
    terms: DataTypes.TEXT,

    // GST 🇮🇳
    gstin: DataTypes.STRING,
    customer_gstin: DataTypes.STRING,
    place_of_supply: DataTypes.STRING,
    cgst_amount: DataTypes.DECIMAL,
    sgst_amount: DataTypes.DECIMAL,
    igst_amount: DataTypes.DECIMAL,
    reverse_charge: DataTypes.BOOLEAN,

    // Template snapshot
    template_snapshot: DataTypes.JSON,

    // Custom fields
    custom_fields: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  },
  {
    tableName: "invoices",
    timestamps: true
  }
);

export default Invoice;