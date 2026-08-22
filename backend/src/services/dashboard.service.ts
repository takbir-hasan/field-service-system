import {
  getDashboardSummary,
  getTechnicianStatistics,
} from "../repositories/dashboard.repository";

export const getSummary = async () => {
  return getDashboardSummary();
};

export const getTechnicians = async () => {
  return getTechnicianStatistics();
};