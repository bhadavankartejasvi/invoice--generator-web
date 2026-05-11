import Joi from "joi";

export const clientSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{7,20}$/).required(),
  address: Joi.string().allow("", null).optional(),
  notes: Joi.string().allow("", null).optional()
}).unknown(true);