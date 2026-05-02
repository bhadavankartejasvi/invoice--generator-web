import Joi from "joi";

export const invoiceSchema = Joi.object({
  client_id: Joi.number().required(),
  template_id: Joi.number().required(),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.number().optional().allow(null),
      description: Joi.string().optional().allow(""),
      quantity: Joi.number().required(),
      price: Joi.number().required(),
      tax_rate: Joi.number().required()
    }).unknown(true)
  )
}).unknown(true);