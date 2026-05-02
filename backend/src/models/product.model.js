import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define("Product", {
  name: DataTypes.STRING,
  sku: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.FLOAT,
  tax_rate: DataTypes.FLOAT
}, {
  tableName: "products",
  timestamps: true
});

export default Product;