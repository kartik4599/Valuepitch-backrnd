import { Router } from "express";
import {
  authMiddleware,
  getUserData,
  loginHandler,
} from "../controller/auth.controller";

const authRouter = Router();

authRouter.post("/login", loginHandler);

authRouter.get("/me", authMiddleware("all"), getUserData);

export default authRouter;
