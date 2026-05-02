import RecurringInvoice from "../../models/recurringInvoice.model.js";

export const createRecurring = (data) =>
  RecurringInvoice.create(data);

export const getRecurring = () =>
  RecurringInvoice.findAll();

export const deleteRecurring = async (id) => {
  const rec = await RecurringInvoice.findByPk(id);

  if (!rec) throw new Error("Not found");

  await rec.destroy();
};