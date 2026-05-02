import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reset_token: DataTypes.STRING,
  reset_token_expiry: DataTypes.DATE
}, {
  tableName: "users",
  timestamps: true
});

export default User;