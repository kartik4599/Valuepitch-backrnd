import { Request, Response } from "express";
import { prisma } from "../index";
import { addOperation } from "./operation.controller";
import { deleteUser, updateUser } from "./socket.controller";

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        industry: { select: { name: true, id: true, type: true } },
      },
    });

    await addOperation({ status: "success", message: "getAllClients api" });
    return res.json({ data: clients, message: "Received client data" });
  } catch (e: any) {
    await addOperation({ status: "error", message: "getAllClients api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const getClientDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      await addOperation({
        type: "validation",
        message: "getClientDetail api",
      });
      return res.status(400).json({ message: "Invalid ID" });
    }

    const client = await prisma.client.findUnique({
      where: { id },
      include: { industry: true },
    });

    if (!client) {
      await addOperation({
        type: "validation",
        message: "getClientDetail api",
      });
      return res.status(400).json({ message: "Invalid ID" });
    }

    await addOperation({ status: "success", message: "getClientDetail api" });
    res.json({ message: "Received client data", data: client }).status(200);
  } catch (e: any) {
    await addOperation({ status: "error", message: "getClientDetail api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      industryName,
      industryType,
      industrySize,
      site,
      notes,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !industryName ||
      !industryType ||
      !industrySize
    ) {
      await addOperation({ type: "validation", message: "createClient api" });
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const existingClient = await prisma.client.findUnique({ where: { email } });

    if (existingClient) {
      await addOperation({ type: "validation", message: "createClient api" });
      return res.status(400).json({ message: "Email already in use" });
    }

    // Add client to database
    await prisma.client.create({
      data: {
        name,
        email,
        password,
        phone,
        address,
        industry: {
          create: {
            name: industryName,
            type: industryType,
            size: industrySize,
            site,
            notes,
          },
        },
      },
    });

    await addOperation({ status: "success", message: "createClient api" });
    res.json({ message: "Client Created Successfully" }).status(200);
  } catch (e: any) {
    await addOperation({ status: "error", message: "createClient api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      industryName,
      industryType,
      industrySize,
      site,
      notes,
    } = req.body;

    const id = req.params.id;
    if (!id) {
      await addOperation({ type: "validation", message: "updateClient api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    const client = await prisma.client.findUnique({
      where: { id },
      include: { industry: true },
    });

    if (!client || !client.industry) {
      await addOperation({ type: "validation", message: "updateClient api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (email !== client.email) {
      const existingClient = await prisma.client.findUnique({
        where: { email },
      });
      if (existingClient) {
        await addOperation({ type: "validation", message: "updateClient api" });
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Add client to database
    await prisma.client.update({
      where: { id: client.id },
      data: {
        name: name || client.name,
        email: email || client.email,
        password: password || client.password,
        phone: phone || client.phone,
        address: address || client.address,
      },
    });

    await prisma.industry.update({
      where: { clientId: client.id },
      data: {
        name: industryName || client.industry.name,
        type: industryType || client.industry.type,
        size: industrySize || client.industry.size,
        site: site || client.industry.site,
        notes: notes || client.industry.notes,
      },
    });

    await addOperation({ status: "success", message: "updateClient api" });
    res.json({ message: "Client Updated Successfully" }).status(200);
    await updateUser(client.id, "client");
  } catch (e: any) {
    await addOperation({ status: "error", message: "updateClient api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      await addOperation({ type: "validation", message: "deleteClient api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) {
      await addOperation({ type: "validation", message: "deleteClient api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    await prisma.industry.delete({ where: { clientId: client.id } });
    await prisma.client.delete({ where: { id } });

    await addOperation({ status: "success", message: "deleteClient api" });
    res.json({ message: "Client Deleted Successfully" }).status(200);
    deleteUser(client.id);
  } catch (e: any) {
    await addOperation({ status: "error", message: "deleteClient api" });
    res.status(500).json({ message: "Server Error" });
  }
};
