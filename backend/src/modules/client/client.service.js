import Client from "../../models/client.model.js";

// CREATE (with duplicate check)
export const createClient = async (data) => {
  if (!data.name) throw new Error("Client name is required");
  if (!data.email) throw new Error("Email address is required");

  const existing = await Client.findOne({
    where: { email: data.email }
  });

  if (existing) {
    throw new Error("Client with this email already exists");
  }

  return Client.create(data);
};

// GET ALL
export const getClients = async (query = {}) => {
  const { search } = query;
  const where = {};
  
  if (search) {
    const { Op } = await import("sequelize");
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { company: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }
  
  return Client.findAll({ where });
};

// GET ONE
export const getClientById = (id) => Client.findByPk(id);

// UPDATE
export const updateClient = async (id, data) => {
  const client = await Client.findByPk(id);

  if (!client) throw new Error("Client not found");
  if (data.name !== undefined && !data.name) throw new Error("Client name cannot be empty");
  if (data.email !== undefined && !data.email) throw new Error("Email address cannot be empty");

  // prevent duplicate email on update
  if (data.email) {
    const existing = await Client.findOne({
      where: { email: data.email }
    });

    if (existing && existing.id !== Number(id)) {
      throw new Error("Email already in use");
    }
  }

  await client.update(data);
  return client;
};

// DELETE
export const deleteClient = async (id) => {
  const client = await Client.findByPk(id);

  if (!client) throw new Error("Client not found");

  await client.destroy();
};