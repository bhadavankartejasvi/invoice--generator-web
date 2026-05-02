import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const RecurringInvoice = sequelize.define(
  "RecurringInvoice",
  {
    client_id: DataTypes.INTEGER,
    template_id: DataTypes.INTEGER,

    interval_type: {
      type: DataTypes.ENUM("daily", "weekly", "monthly"),
      defaultValue: "monthly"
    },

    next_run_date: DataTypes.DATE,

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: "recurring_invoices",
    timestamps: true
  }
);

export default RecurringInvoice;