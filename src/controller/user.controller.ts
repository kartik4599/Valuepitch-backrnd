import { Request, Response } from "express";
import { prisma } from "../index";
import { descodedToken } from "./auth.controller";
import { addOperation } from "./operation.controller";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const auth = req.auth as descodedToken;

    let where = {};
    if (auth.role !== "superadmin" && auth.type === "client") {
      where = { industryId: auth.industryId };
    }

    const clients = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      where: { ...where, role: { not: "superadmin" } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        industry: { select: { name: true, id: true, type: true } },
      },
    });

    await addOperation({ status: "success", message: "getAllUsers api" });
    return res.json({ data: clients, message: "Received user data" });
  } catch (e: any) {
    await addOperation({ status: "error", message: "getAllUsers api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUserDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      await addOperation({ type: "validation", message: "getUserDetail api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { industry: true },
    });

    if (!user) {
      await addOperation({ type: "validation", message: "getUserDetail api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    await addOperation({ status: "success", message: "getUserDetail api" });
    res.json({ message: "Received user data", data: user }).status(200);
  } catch (e: any) {
    await addOperation({ status: "error", message: "getUserDetail api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const auth = req.auth as descodedToken;

    const { name, email, password, phone, address, industryId, role } =
      req.body;

    if (!name || !email || !password || !phone || !industryId) {
      await addOperation({ type: "validation", message: "createUser api" });
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      await addOperation({ type: "validation", message: "createUser api" });
      return res.status(400).json({ message: "Email already in use" });
    }

    const industry = await prisma.industry.findUnique({
      where: { id: industryId },
    });

    if (!industry) {
      await addOperation({ type: "validation", message: "createUser api" });
      return res.status(400).json({ message: "Invalid Industry ID" });
    }

    if (auth.type === "client" && industry.id !== auth.industryId) {
      await addOperation({ type: "validation", message: "createUser api" });
      return res
        .status(400)
        .json({ message: "Unauthorized to create from another industry" });
    }

    // Add client to database
    await prisma.user.create({
      data: {
        name,
        email,
        password,
        phone,
        address,
        role,
        industry: { connect: { id: industryId } },
      },
    });

    await addOperation({ status: "success", message: "createUser api" });
    res.json({ message: "User Created Successfully" }).status(200);
  } catch (e: any) {
    await addOperation({ status: "error", message: "createUser api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const auth = req.auth as descodedToken;

    const { name, email, password, phone, address, industryId, role } =
      req.body;

    const id = req.params.id;

    if (!id) {
      await addOperation({ type: "validation", message: "updateUser api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      await addOperation({ type: "validation", message: "updateUser api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        await addOperation({ type: "validation", message: "updateUser api" });
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (auth.type === "client" && industryId !== auth.industryId) {
      await addOperation({ type: "validation", message: "updateUser api" });
      return res
        .status(400)
        .json({ message: "Unauthorized to update from another industry" });
    }

    // Add client to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        email: email || user.email,
        password: password || user.password,
        phone: phone || user.phone,
        address: address || user.address,
        role: role || user.role,
      },
    });

    await addOperation({ status: "success", message: "updateUser api" });
    res.json({ message: "User Updated Successfully" }).status(200);
  } catch (e: any) {
    await addOperation({ status: "error", message: "updateUser api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const auth = req.auth as descodedToken;

    const id = req.params.id;

    if (!id) {
      await addOperation({ type: "validation", message: "deleteUser api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      await addOperation({ type: "validation", message: "deleteUser api" });
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (auth.type === "client" && user.industryId !== auth.industryId) {
      await addOperation({ type: "validation", message: "deleteUser api" });
      return res
        .status(400)
        .json({ message: "Unauthorized to delete from another industry" });
    }

    await prisma.user.delete({ where: { id } });

    await addOperation({ status: "success", message: "deleteUser api" });
    res.json({ message: "User Deleted Successfully" }).status(200);
  } catch (e: any) {
    await addOperation({ status: "error", message: "deleteUser api" });
    res.status(500).json({ message: "Server Error" });
  }
};
