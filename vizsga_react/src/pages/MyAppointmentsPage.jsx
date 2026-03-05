import { useEffect, useState } from "react";
import { useBooking } from "../contexts/BookingContext";
import { useAuth } from "../contexts/AuthContext";

const STATUS_LABELS = {
  confirmed: { label: "Visszaigazolva", cls: "status-confirmed" },
  cancelled: { label: "Lemondva", cls: "status-cancelled" },
  completed: { label: "Teljesítve", cls: "status-completed" },
};

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const { fetchAppointments, cancelAppointment } = useBooking();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAppointments({ customerId: user.id });
      setAppointments(data);
    } finally { setLoading(false); }
  }

  async function handleCancel(id) {
    if (!window.confirm("Biztosan le szeretnéd mondani ezt az időpontot?")) return;
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, ...updated } : a));
    } catch (e) { alert("Hiba: " + e.message); }
  }

  const now = new Date();
  const filtered = appointments.filter((a) => {
    const d = new Date(`${a.date}T${a.time}`);
    if (filter === "upcoming") return d >= now && a.status !== "cancelled";
    if (filter === "past") return d < now || a.status === "completed";
    if (filter === "cancelled") return a.status === "cancelled";
    return true;
  }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  return (
    <div className="page my-appointments-page">
      <div className="page-header">
        <h1>Foglalásaim</h1>
        <p className="page-subtitle">Tekintsd meg és kezeld időpontjaidat</p>
      </div>
      <div className="filter-tabs">
        {[{ key: "upcoming", label: "Közelgő" }, { key: "past", label: "Korábbi" }, { key: "cancelled", label: "Lemondott" }, { key: "all", label: "Összes" }].map((f) => (
          <button key={f.key} className={`filter-tab ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>
      {loading ? (
        <div className="loading-state">Betöltés...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Nincs foglalás ebben a kategóriában</h3>
          <p>Látogass el a Szolgáltatások oldalra és foglalj időpontot!</p>
        </div>
      ) : (
        <div className="appointments-list">
          {filtered.map((a) => {
            const d = new Date(`${a.date}T${a.time}`);
            const isPast = d < now;
            const statusInfo = STATUS_LABELS[a.status] || { label: a.status, cls: "" };
            const providerName = a.provider?.name || a.professionalName || "–";
            const serviceName = a.service?.name || a.serviceName || "–";
            const servicePrice = a.service?.price || a.servicePrice;
            const serviceDuration = a.service?.duration;
            return (
              <div key={a.id} className={`appointment-card ${a.status}`}>
                <div className="appt-left">
                  <div className="appt-date-block">
                    <span className="appt-day">{d.toLocaleDateString("hu-HU", { day: "numeric" })}</span>
                    <span className="appt-month">{d.toLocaleDateString("hu-HU", { month: "short" })}</span>
                  </div>
                </div>
                <div className="appt-body">
                  <div className="appt-top-row">
                    <h3 className="appt-professional">{providerName}</h3>
                    <span className={`appt-status ${statusInfo.cls}`}>{statusInfo.label}</span>
                  </div>
                  <p className="appt-service">{serviceName}</p>
                  <div className="appt-meta">
                    <span className="appt-meta-item">🕐 {d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}</span>
                    {serviceDuration && <span className="appt-meta-item">⏱ {serviceDuration} perc</span>}
                    {servicePrice && <span className="appt-meta-item">💰 {servicePrice} Ft</span>}
                    {a.note && <span className="appt-meta-item">📝 {a.note}</span>}
                  </div>
                </div>
                <div className="appt-actions">
                  {a.status === "confirmed" && !isPast && (
                    <button className="btn-cancel-appt" onClick={() => handleCancel(a.id)}>Lemondás</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}