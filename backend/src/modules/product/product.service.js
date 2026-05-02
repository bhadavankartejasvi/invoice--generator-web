import Product from "../../models/product.model.js";

export const createProduct = (data) => Product.create(data);
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
export const updateProduct = (id, data) =>
  Product.update(data, { where: { id } });

export const deleteProduct = (id) =>
  Product.destroy({ where: { id } });