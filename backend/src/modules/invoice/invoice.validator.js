import Joi from "joi";

export const invoiceSchema = Joi.object({
  client_id: Joi.number().required(),
  template_id: Joi.number().required(),
  due_date: Joi.date().optional(),
  items: Joi.array().min(1).items(
    Joi.object({
      product_id: Joi.number().required(),
      description: Joi.string().required(),
      quantity: Joi.number().required(),
      price: Joi.number().required(),
      tax_rate: Joi.number().required()
    }).unknown(true)
  ).required()
}).unknown(true);