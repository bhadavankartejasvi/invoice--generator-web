import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AuditLog = sequelize.define("AuditLog", {
  user_id: DataTypes.INTEGER,
  action: DataTypes.STRING,
  entity: DataTypes.STRING,
  entity_id: DataTypes.INTEGER,
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: "audit_logs",
  timestamps: true
});

export default AuditLog;