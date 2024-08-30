import { Router } from "express";
import { authMiddleware } from "../controller/auth.controller";
import {
  createClient,
  deleteClient,
  getAllClients,
  updateClient,
} from "../controller/client.controller";

const clientRouter = Router();

clientRouter.get("/", authMiddleware("superadmin"), getAllClients);

clientRouter.post("/", authMiddleware("superadmin"), createClient);

clientRouter.put("/:id", authMiddleware("superadmin"), updateClient);

clientRouter.delete("/:id", authMiddleware("superadmin"), deleteClient);

export default clientRouter;
