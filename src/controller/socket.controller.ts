import { io, prisma } from "../index";
import { descodedToken } from "./auth.controller";
import { addOperation } from "./operation.controller";

export const setSocketId = async (data: descodedToken, id: string) => {
  try {
    const exist = await prisma.socketData.findUnique({
      where: { id: data.id },
    });
    if (exist) {
      await prisma.socketData.update({
        where: { id: data.id },
        data: { socketId: id },
      });
    } else {
      await prisma.socketData.create({
        data: { id: data.id, socketId: id, type: data.type },
      });
    }
    console.log("setted");

    addOperation({ status: "success" });
  } catch (e) {
    addOperation({ status: "error" });
  }
};

export const updateUser = async (id: string, type: "user" | "client") => {
  const socketData = await prisma.socketData.findUnique({ where: { id } });
  if (!socketData || !socketData.socketId) return;

  const profile =
    type === "user"
      ? await prisma.user.findUnique({
          where: { id },
          include: { industry: true },
        })
      : await prisma.client.findUnique({
          where: { id },
          include: { industry: true },
        });

  io.to(socketData.socketId).emit("update", profile);
  console.log("updateUser");
};

export const deleteUser = async (id: string) => {
  const socketData = await prisma.socketData.findUnique({ where: { id } });
  if (!socketData || !socketData.socketId) return;

  io.to(socketData.socketId).emit("delete");
};
