import Product from "../../models/product.model.js";
import { fn, col, where } from "sequelize";

const normalizeProductName = (name) => name?.trim();

export const createProduct = async (data) => {
  if (!data.name) throw new Error("Product name is required");

  const name = normalizeProductName(data.name);
  const existing = await Product.findOne({
    where: where(fn("lower", col("name")), name.toLowerCase())
  });

  if (existing) {
    throw new Error("Product with this name already exists");
  }

  return Product.create({
    ...data,
    name
  });
};
export const getProducts = async (query = {}) => {
  const { search } = query;
  const where = {};
  
  if (search) {
    const { Op } = await import("sequelize");
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }
  
  return Product.findAll({ where });
};
export const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("Product not found");

  if (data.name) {
    const name = normalizeProductName(data.name);
    const existing = await Product.findOne({
      where: where(fn("lower", col("name")), name.toLowerCase())
    });

    if (existing && existing.id !== Number(id)) {
      throw new Error("Product name already in use");
    }

    data.name = name;
  }

  await product.update({
    ...data,
    price: data.price !== undefined ? Number(data.price) : product.price
  });
  return product;
};

export const deleteProduct = (id) =>
  Product.destroy({ where: { id } });