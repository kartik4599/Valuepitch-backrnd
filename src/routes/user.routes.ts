import { Router } from "express";
import { authMiddleware } from "../controller/auth.controller";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getIndustry,
  updateUser,
} from "../controller/user.controller";

const userRouter = Router();

userRouter.get("/", authMiddleware("admin"), getAllUsers);

userRouter.post("/", authMiddleware("admin"), createUser);

userRouter.put("/:id", authMiddleware("admin"), updateUser);

userRouter.delete("/:id", authMiddleware("admin"), deleteUser);

export default userRouter;
