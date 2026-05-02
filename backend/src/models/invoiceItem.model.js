import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const InvoiceItem = sequelize.define(
  "InvoiceItem",
  {
    invoice_id: {
      type: DataTypes.INTEGER
    },

    description: DataTypes.STRING,
    quantity: DataTypes.DECIMAL,
    unit_price: DataTypes.DECIMAL,
    tax_rate: DataTypes.DECIMAL,
    discount: DataTypes.DECIMAL,
    amount: DataTypes.DECIMAL,
    unit: DataTypes.STRING,

    custom_fields: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  },
  {
    tableName: "invoice_items",
    timestamps: false
  }
);

export default InvoiceItem;