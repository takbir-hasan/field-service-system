import api from "../../api/axios";

export interface DashboardSummary {
  total_tickets: number;
  open_tickets?: number;
  assigned_tickets: number;
  in_progress_tickets: number;
  completed_tickets: number;
  cancelled_tickets: number;
  urgent_tickets: number;
  high_priority_tickets?: number;
}

export const getAdminDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get<{
    success: boolean;
    data: DashboardSummary;
  }>("/dashboard/summary");

  return response.data.data;
};

export const getTechnicianDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get<{
    success: boolean;
    data: DashboardSummary;
  }>("/dashboard/my-summary");

  return response.data.data;
};
