-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('client', 'user');

-- CreateTable
CREATE TABLE "SocketData" (
    "id" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "socketId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocketData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocketData_id_key" ON "SocketData"("id");
