import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Template = sequelize.define(
  "Template",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    config: {
      type: DataTypes.JSON,
      allowNull: false
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: "templates",
    timestamps: true,
    paranoid: true
  }
);

export default Template;