import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const clientRouter = Router();
const prisma = new PrismaClient();

clientRouter.get("/", (req, res) => {
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
  } catch (e: any) {
    res.json({ message: e.message }).status(400);
  }
});

export default clientRouter;
