import Joi from "joi";

export const clientSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.string().allow("", null).optional(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow("", null).optional(),
  address: Joi.string().allow("", null).optional(),
  notes: Joi.string().allow("", null).optional()
}).unknown(true);