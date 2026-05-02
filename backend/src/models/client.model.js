import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Client = sequelize.define(
  "Client",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true
  }
},
    company: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    notes: DataTypes.TEXT
  },
  {
    tableName: "clients",
    timestamps: true
  }
);

export default Client;