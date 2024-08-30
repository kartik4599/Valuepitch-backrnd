import { Request, Response } from "express";
import { prisma } from "../index";

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

    return res.json({ data: clients, message: "Received client data" });
  } catch (e: any) {
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
      throw new Error("Please provide all required fields");
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

    res.json({ message: "Client Created Successfully" }).status(200);
  } catch (e: any) {
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

    if (!id) return res.status(400).json({ message: "Invalid ID" });

    const client = await prisma.client.findUnique({
      where: { id },
      include: { industry: true },
    });

    if (!client || !client.industry) {
      return res.status(400).json({ message: "Invalid ID" });
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

    res.json({ message: "Client Updated Successfully" }).status(200);
  } catch (e: any) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) return res.status(400).json({ message: "Invalid ID" });

    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) return res.status(400).json({ message: "Invalid ID" });

    await prisma.industry.delete({ where: { clientId: client.id } });
    await prisma.client.delete({ where: { id } });

    res.json({ message: "Client Deleted Successfully" }).status(200);
  } catch (e: any) {
    res.status(500).json({ message: "Server Error" });
  }
};

