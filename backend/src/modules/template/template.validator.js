import Joi from "joi";

export const templateSchema = Joi.object({
  name: Joi.string().required(),
  config: Joi.object().required()
});