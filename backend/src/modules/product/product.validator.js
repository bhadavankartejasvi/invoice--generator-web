import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().allow("", null).optional(),
  price: Joi.number().required(),
  tax_rate: Joi.number().allow(null).optional(),
  description: Joi.string().allow("", null).optional()
}).unknown(true);