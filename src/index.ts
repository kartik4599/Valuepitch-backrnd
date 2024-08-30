import { PrismaClient } from "@prisma/client";
import express from "express";
import authRouter from "./routes/auth.routes";
import clientRouter from "./routes/client.routes";
import cors from "cors";
import userRouter from "./routes/user.routes";
const app = express();

app.use(express.json(), cors({ origin: "*" }));

app.use("/", authRouter);
app.use("/client", clientRouter);
app.use("/user", userRouter);

export const prisma = new PrismaClient();

app.listen(4500, () => {
  console.log("App listening on port 4500!");
});
