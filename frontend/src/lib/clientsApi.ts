import { apiFetch } from "./api";

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: string;
  address: string;
  workplace: string;
  service_type: string;
  status: "yangi" | "ko'rildi" | "tugatildi";
  payment_status: "kutilmoqda" | "tolangan" | "rad_etilgan";
  payment_date: string | null;
  payment_amount: number | null;
  notes: string | null;
  registered_at: string;
  created_at: string;
}

export interface ClientInput {
  first_name: string;
  last_name: string;
  birth_year: string;
  address: string;
  workplace: string;
  service_type: string;
  notes?: string;
}

export interface ListClientsParams {
  payment_status?: string;
  status?: string;
  search?: string;
  ordering?: string;
}

const toQueryString = (params?: ListClientsParams) => {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const s = search.toString();
  return s ? `?${s}` : "";
};

export const listClients = (params?: ListClientsParams) =>
  apiFetch<Client[]>(`/api/clients/${toQueryString(params)}`);

export const createClient = (data: ClientInput) =>
  apiFetch<Client>("/api/clients/", { method: "POST", body: JSON.stringify(data) });

export const updateClient = (id: string, data: Partial<ClientInput>) =>
  apiFetch<Client>(`/api/clients/${id}/`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteClient = (id: string) =>
  apiFetch<null>(`/api/clients/${id}/`, { method: "DELETE" });

export const markPaid = (id: string) =>
  apiFetch<Client>(`/api/clients/${id}/mark_paid/`, { method: "POST" });

export const rejectPayment = (id: string) =>
  apiFetch<Client>(`/api/clients/${id}/reject_payment/`, { method: "POST" });

export const completeClient = (id: string) =>
  apiFetch<Client>(`/api/clients/${id}/complete/`, { method: "POST" });

export interface ServiceItem {
  name: string;
  price: number;
}

export const getServices = () => apiFetch<Record<string, ServiceItem[]>>("/api/services/");
