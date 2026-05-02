import Joi from "joi";

export const recurringSchema = Joi.object({
  client_id: Joi.number().required(),
  template_id: Joi.number().required(),
  interval_type: Joi.string().valid("monthly", "quarterly", "yearly").default("monthly"),
  next_run: Joi.date().required(),
  source_invoice_id: Joi.number().optional()
});
