import { createContext, useState, useContext, useCallback } from "react";

const BookingContext = createContext();
const API = "http://localhost:3000";

export function BookingProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Foglalások lekérése – filters: { customerId, providerId, date, status }
  const fetchAppointments = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.customerId) params.append("customerId", filters.customerId);
      if (filters.providerId) params.append("providerId", filters.providerId);
      if (filters.date) params.append("date", filters.date);
      if (filters.status) params.append("status", filters.status);
      // Admin: all appointments
      const endpoint = filters.all ? "/appointments/all" : `/appointments?${params}`;
      const res = await fetch(`${API}${endpoint}`);
      const data = await res.json();
      setAppointments(data);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = async ({ customerId, providerId, serviceId, date, time, note }) => {
    const res = await fetch(`${API}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, providerId, serviceId, date, time, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Foglalás sikertelen");
    setAppointments((prev) => [...prev, data]);
    return data;
  };

  const cancelAppointment = async (id) => {
    const res = await fetch(`${API}/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const updated = await res.json();
    if (!res.ok) throw new Error(updated.error || "Lemondás sikertelen");
    return updated;
  };

  const updateAppointment = async (id, data) => {
    const res = await fetch(`${API}/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    if (!res.ok) throw new Error(updated.error || "Frissítés sikertelen");
    return updated;
  };

  const fetchAvailableSlots = async (providerId, date) => {
    const params = new URLSearchParams({ providerId });
    if (date) params.append("date", date);
    const res = await fetch(`${API}/availableSlots?${params}`);
    return res.json();
  };

  const addAvailableSlot = async (providerId, { date, time }) => {
    const res = await fetch(`${API}/availableSlots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, date, time }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Időpont hozzáadás sikertelen");
    return data;
  };

  const deleteAvailableSlot = async (slotId) => {
    const res = await fetch(`${API}/availableSlots/${slotId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Törlés sikertelen");
  };

  return (
    <BookingContext.Provider value={{
      appointments, loading,
      fetchAppointments, createAppointment, cancelAppointment, updateAppointment,
      fetchAvailableSlots, addAvailableSlot, deleteAvailableSlot,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
