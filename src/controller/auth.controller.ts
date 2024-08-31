import { NextFunction, Request, Response } from "express";
import { prisma } from "../index";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client/edge";
import { addOperation } from "./operation.controller";

export interface descodedToken {
  id: string;
  type: "client" | "user";
  role?: Role;
  industryId?: string;
}

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      await addOperation({ type: "validation", message: "login api" });
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const [user, client] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email,
        },
        include: { industry: true },
      }),
      prisma.client.findUnique({
        where: {
          email,
        },
        include: { industry: true },
      }),
    ]);

    if (!user && !client) {
      await addOperation({ type: "validation", message: "login api" });
      return res.status(400).json({ message: "Account not found" });
    }

    if (
      (user && user.password !== password) ||
      (client && client.password !== password)
    ) {
      await addOperation({ type: "validation", message: "login api" });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const data = {
      id: (user || client)?.id,
      type: client ? "client" : "user",
      role: user?.role,
      industryId: (user || client)?.industry?.id,
    };
    let token = jwt.sign(data, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    await addOperation({ status: "success", message: "login api" });
    return res.json({
      message: "Login successful",
      token,
      data,
      profile: user || client,
    });
  } catch (e) {
    res.json({ message: "Something went wrong", isError: true }).status(500);
  }
};

export const authMiddleware = (type: "superadmin" | "admin" | "all") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        await addOperation({ type: "unauthorized", message: "unauthorized" });
        return res.status(401).json({
          message: "Unauthorized",
          isError: true,
        });
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        await addOperation({ type: "unauthorized", message: "unauthorized" });
        return res.status(401).json({
          message: "Unauthorized",
          isError: true,
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as
        | descodedToken
        | undefined;

      if (!decoded) {
        await addOperation({ type: "unauthorized", message: "unauthorized" });
        return res.status(401).json({
          message: "Unauthorized",
          isError: true,
        });
      }

      const [user, client] = await Promise.all([
        prisma.user.findUnique({
          where: {
            id: decoded.id,
          },
        }),
        prisma.client.findUnique({
          where: {
            id: decoded.id,
          },
        }),
      ]);
      if (!user && !client) {
        await addOperation({ type: "unauthorized", message: "unauthorized" });
        return res.status(401).json({
          message: "Unauthorized",
          isError: true,
        });
      }

      if (type === "superadmin") {
        if (client || user?.role === "user") {
          await addOperation({ type: "unauthorized", message: "unauthorized" });
          return res.status(401).json({
            message: "Unauthorized",
            isError: true,
          });
        }
      }

      if (type === "admin") {
        if (!client && user?.role === "user") {
          await addOperation({ type: "unauthorized", message: "unauthorized" });
          return res.status(401).json({
            message: "Unauthorized",
            isError: true,
          });
        }
      }

      req.auth = decoded;
      next();
    } catch (e) {
      res.json({ message: "Something went wrong", isError: true }).status(500);
    }
  };
};

export const getUserData = async (req: Request, res: Response) => {
  const auth = req.auth as descodedToken;

  const profile =
    auth.type === "client"
      ? await prisma.client.findUnique({
          where: { id: auth.id },
          include: { industry: true },
        })
      : await prisma.user.findUnique({
          where: { id: auth.id },
          include: { industry: true },
        });

  return res
    .json({ message: "User data", data: req.auth, profile })
    .status(200);
};
