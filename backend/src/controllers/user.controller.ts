import { Request, Response } from "express";

import { getTechnicians } from "../repositories/user.repository";
import { AppError } from "../errors/AppError";

export const getTechniciansController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(
      401,
      "Unauthorized"
    );
  }

  const technicians =
    await getTechnicians();

  return res.status(200).json({
    success: true,
    data: technicians,
  });
};