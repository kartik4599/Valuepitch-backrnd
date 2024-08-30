import { Router } from "express";
import { authMiddleware } from "../controller/auth.controller";
import { getindustry, getReport } from "../controller/operation.controller";

const operationRouter = Router();

operationRouter.get("/industry", authMiddleware("all"), getindustry);

operationRouter.get("/report", authMiddleware("superadmin"), getReport);

export default operationRouter;
