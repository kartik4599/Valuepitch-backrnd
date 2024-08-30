import { Router } from "express";
import { authMiddleware } from "../controller/auth.controller";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserDetail,
  updateUser,
} from "../controller/user.controller";

const userRouter = Router();

userRouter.get("/", authMiddleware("admin"), getAllUsers);

userRouter.get("/:id", authMiddleware("admin"), getUserDetail);

userRouter.post("/", authMiddleware("admin"), createUser);

userRouter.put("/:id", authMiddleware("admin"), updateUser);

userRouter.delete("/:id", authMiddleware("admin"), deleteUser);

export default userRouter;
