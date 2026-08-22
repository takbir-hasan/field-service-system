import { Request, Response } from "express";

import {
  getSummary,
  getTechnicians,
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