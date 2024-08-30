import { NextFunction, Request, Response } from "express";
import { prisma } from "../index";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client/edge";

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
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const [user, client] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email,
        },
      }),
      prisma.client.findUnique({
        where: {
          email,
        },
      }),
    ]);

    if (!user && !client) {
      return res.status(400).json({ message: "Account not found" });
    }

    if (
      (user && user.password !== password) ||
      (client && client.password !== password)
    ) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let token = jwt.sign(
      {
        id: (user || client)?.id,
        type: client ? "client" : "user",
        role: user?.role,
        industryId: user?.industryId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    return res.json({
      message: "Login successful",
      token,
      data: {
        id: (user || client)?.id,
        type: client ? "client" : "user",
        role: user?.role,
      },
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
        return res.status(400).json({
          message: "Unauthorized",
          isError: true,
        });
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          message: "Unauthorized",
          isError: true,
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as
        | descodedToken
        | undefined;

      if (!decoded) {
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
        return res.status(401).json({
          message: "Unauthorized",
          isError: true,
        });
      }

      if (type === "superadmin") {
        if (client || user?.role === "user") {
          return res.status(401).json({
            message: "Unauthorized",
            isError: true,
          });
        }
      }

      if (type === "admin") {
        if (!client && user?.role === "user") {
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
