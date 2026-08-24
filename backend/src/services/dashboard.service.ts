import {
  getDashboardSummary,
  getTechnicianStatistics,
  getTechnicianDashboardSummary,
} from "../repositories/dashboard.repository";

export const getSummary = async () => {
  return getDashboardSummary();
};

export const getTechnicians = async () => {
  return getTechnicianStatistics();
};

export const getTechnicianSummary = async (
  technicianId: number
) => {
  return getTechnicianDashboardSummary(technicianId);
};