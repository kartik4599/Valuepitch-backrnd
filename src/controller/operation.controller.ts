import { OperationsStatus } from "@prisma/client/index-browser";
import { ErrorType } from "@prisma/client/wasm";
import { Request, Response } from "express";
import { prisma } from "../index";
import { descodedToken } from "./auth.controller";

interface InputOperation {
  status?: OperationsStatus;
  type?: ErrorType;
  message?: string;
}

type result = Record<
  string,
  {
    success: number;
    error: number;
  }
>;

export const addOperation = async ({
  message,
  status,
  type,
}: InputOperation) => {
  await prisma.operations.create({
    data: {
      status: status || OperationsStatus.error,
      message: message || "Default Message",
      type: type || ErrorType.server,
    },
  });
};

export const getindustry = async (req: Request, res: Response) => {
  try {
    const auth = req.auth as descodedToken;

    let where = {};
    if (auth.type === "client") {
      where = { id: auth.industryId };
    }

    const industry = await prisma.industry.findMany({ where });

    return res
      .json({ message: "Received industry data", data: industry })
      .status(200);
  } catch (e) {
    await addOperation({ status: "error", message: "getindustry api" });
    res.status(500).json({ message: "Server Error" });
  }
};

export const getChartData = async (where: {}) => {
  const data = await prisma.operations.findMany({
    where,
    select: { createdAt: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  const result: result = {};
  data.forEach(({ createdAt, status }) => {
    const key = `${createdAt.getFullYear()}-${
      createdAt.getMonth() + 1
    }-${createdAt.getDate()}`;
    if (!result[key]) {
      result[key] = {
        success: 0,
        error: 0,
      };
    }

    if (status === "success") {
      return result[key].success++;
    }
    return result[key].error++;
  });

  const finalData = Object.entries(result).map(
    ([date, { success, error }]) => ({ date, success, error })
  );
  return finalData;
};

const getErrorInformation = async (where: {}) => {
  const [
    totalcount,
    totalSuccess,
    totalErrors,
    totalValidationErrors,
    totalUnauthorizedErrors,
    totalServerError,
  ] = await Promise.all([
    prisma.operations.count({ where: { ...where } }),
    prisma.operations.count({ where: { status: "success", ...where } }),
    prisma.operations.count({ where: { status: "error", ...where } }),
    prisma.operations.count({
      where: { status: "error", type: "validation", ...where },
    }),
    prisma.operations.count({
      where: { status: "error", type: "unauthorized", ...where },
    }),
    prisma.operations.count({
      where: { status: "error", type: "server", ...where },
    }),
  ]);

  return {
    totalSuccess,
    successPercentage: totalSuccess * (100 / totalcount),
    totalErrors,
    errorPercentage: totalErrors * (100 / totalcount),
    totalValidationErrors,
    validationPercentage: totalValidationErrors * (100 / totalErrors),
    totalUnauthorizedErrors,
    unauthorizedPercentage: totalUnauthorizedErrors * (100 / totalErrors),
    totalServerError,
    serverPercentage: totalServerError * (100 / totalErrors),
  };
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as "90d" | "30d" | "7d" | "all";
    let daysToSubtract: number | null = null;

    if (type === "90d") daysToSubtract = 90;
    if (type === "30d") daysToSubtract = 30;
    if (type === "7d") daysToSubtract = 7;
    if (type === "all") daysToSubtract = null;

    let where = {};

    if (daysToSubtract) {
      const now = new Date();
      now.setDate(now.getDate() - daysToSubtract);
      where = { createdAt: now };
    }

    const [info, chartinfo] = await Promise.all([
      getErrorInformation(where),
      getChartData(where),
    ]);
    res.json({ info, chartinfo });
  } catch (e) {
    console.log(e);

    await addOperation({ status: "error", message: "getReport api" });
    res.status(500).json({ message: "Server Error" });
  }
};
