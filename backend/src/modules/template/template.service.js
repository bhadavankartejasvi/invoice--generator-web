import Template from "../../models/template.model.js";

export const createTemplate = (data) => Template.create(data);

export const getTemplates = () => Template.findAll();

export const getTemplateById = (id) => Template.findByPk(id);

export const updateTemplate = async (id, data) => {
  const template = await Template.findByPk(id);
  if (!template) throw new Error("Template not found");

  await template.update(data);
  return template;
};

export const deleteTemplate = async (id) => {
  const template = await Template.findByPk(id);
  if (!template) throw new Error("Template not found");

  await template.destroy();
};