import { PrismaClient } from "@prisma/client";
import express from "express";
import authRouter from "./routes/auth.routes";
import clientRouter from "./routes/client.routes";
import cors from "cors";
import userRouter from "./routes/user.routes";
import operationRouter from "./routes/operation.routes";
import path from "path";
import { Server } from "socket.io";
import { setSocketId } from "./controller/socket.controller";
const app = express();

app.use(express.json(), cors({ origin: "*" }));

app.use("/api", authRouter, operationRouter);
app.use("/api/client", clientRouter);
app.use("/api/user", userRouter);

export const prisma = new PrismaClient();

// --------------- Hosting frontend ---------------
const dir = path.resolve();
app.use(express.static(path.join(dir, "dist")));
app.get("*", (_, res) =>
  res.sendFile(path.resolve(dir, "dist", "index.html"))
);
// --------------- Hosting frontend ---------------

// --------------- Socket ---------------
const server = app.listen(4500, () => {
  console.log("App listening on port 4500!");
});

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  if (socket.handshake.query.data) {
    console.log(socket.id, "connected");

    const data = JSON.parse(socket.handshake.query.data as any);
    setSocketId(data, socket.id);
  }
});
// --------------- Socket ---------------
