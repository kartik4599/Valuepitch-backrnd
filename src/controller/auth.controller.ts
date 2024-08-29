import { NextFunction, Request, Response } from "express";
import { prisma } from "../index";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client/edge";

export interface descodedToken {
  id: number;
  type: "client" | "user";
  role?: Role;
}

export interface verifiedRequest extends Request {
  auth: descodedToken;
}

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.json({ message: "Please provide all required fields" }).status(400);
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
      return res.json({ message: "Invalid credentials" }).status(400);
    }

    if (
      (user && user.password !== password) ||
      (client && client.password !== password)
    ) {
      return res.json({ message: "Invalid credentials" }).status(400);
    }

    let token = jwt.sign(
      {
        id: (user || client)?.id,
        type: client ? "client" : "user",
        role: user?.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    res
      .json({ message: "Login successful", token, data: user || client })
      .status(200);
  } catch (e) {
    res.json({ message: "Something went wrong", isError: true }).status(500);
  }
};

export const authMiddleware = async (
  req: verifiedRequest,
  res: Response,
  next: NextFunction
) => {
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

    req.auth = decoded;
    next();
  } catch (e) {
    res.json({ message: "Something went wrong", isError: true }).status(500);
  }
};
