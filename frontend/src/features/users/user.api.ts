import api from "../../api/axios";

export interface Technician {
  id: number;
  name: string;
  email: string;
}

export const getTechnicians = async (): Promise<
  Technician[]
> => {
  const response = await api.get<{
    success: boolean;
    data: Technician[];
  }>("/users/technicians");

  return response.data.data;
};