import { Router } from "express";
import { loginHandler } from "../controller/auth.controller";

const authRouter = Router();

authRouter.post("/login", loginHandler);

export default authRouter;
