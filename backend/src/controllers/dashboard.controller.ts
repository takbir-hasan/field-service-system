import { Request, Response } from "express";
import { AppError } from "../errors/AppError";

import {
  getSummary,
  getTechnicians,
  getTechnicianSummary,
} from "../services/dashboard.service";

export const getDashboardSummaryController = async (
  _req: Request,
  res: Response
) => {
  const summary = await getSummary();

  return res.status(200).json({
    success: true,
    data: summary,
  });
};

export const getTechnicianStatisticsController = async (
  _req: Request,
  res: Response
) => {
  const technicians = await getTechnicians();

  return res.status(200).json({
    success: true,
    data: technicians,
  });
};

export const getMyDashboardSummaryController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(
      401,
      "Unauthorized"
    );
  }

  const summary = await getTechnicianSummary(
    req.user.userId
  );

  return res.status(200).json({
    success: true,
    data: summary,
  });
};