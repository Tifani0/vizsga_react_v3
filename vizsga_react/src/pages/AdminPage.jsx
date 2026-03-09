import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBooking } from "../contexts/BookingContext";

const API = "http://localhost:3000";

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAYS = ["H","K","Sze","Cs","P","Szo","V"];
const MONTH_NAMES = ["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"];
const ALL_TIMES = [];
for (let h = 8; h <= 18; h++) {
  ALL_TIMES.push(`${String(h).padStart(2,"0")}:00`);
  if (h < 18) ALL_TIMES.push(`${String(h).padStart(2,"0")}:30`);
}
const STATUS_LABELS = {
  confirmed: { label: "Visszaigazolva", cls: "status-confirmed" },
  cancelled: { label: "Lemondva", cls: "status-cancelled" },
  completed: { label: "Teljesítve", cls: "status-completed" },
};

// ── Szolgáltatás form modal ──────────────────────────────────────────────────
function ServiceFormModal({ service, userId, onClose, onSaved }) {
  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [duration, setDuration] = useState(service?.duration || "");
  const [price, setPrice] = useState(service?.price || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim() || !duration || !price) { setError("Név, időtartam és ár kötelező!"); return; }
    setSaving(true);
    setError("");
    try {
      const method = service ? "PUT" : "POST";
      const url = service ? `${API}/services/${service.id}` : `${API}/services`;
      const body = service
        ? { name, description, duration: Number(duration), price: Number(price) }
        : { name, description, duration: Number(duration), price: Number(price), userId };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Hiba"); return; }
      onSaved(data, !!service);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="service-form-modal">
        <div className="sfm-header">
          <h3>{service ? "Szolgáltatás szerkesztése" : "Új szolgáltatás"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sfm-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Szolgáltatás neve *</label>
            <input className="sfm-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="pl. Hajvágás" />
          </div>
          <div className="form-group">
            <label>Leírás</label>
            <textarea className="sfm-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Rövid leírás..." rows={2} />
          </div>
          <div className="sfm-row">
            <div className="form-group">
              <label>Időtartam (perc) *</label>
              <input className="sfm-input" type="number" min="5" max="480" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" />
            </div>
            <div className="form-group">
              <label>Ár (Ft) *</label>
              <input className="sfm-input" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000" />
            </div>
          </div>
        </div>
        <div className="sfm-footer">
          <button className="btn-cancel" onClick={onClose}>Mégsem</button>
          <button className="btn-book" onClick={handleSave} disabled={saving}>
            {saving ? "Mentés..." : service ? "Módosítás" : "Létrehozás"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Főkomponens ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isAdmin, isProviderOrAdmin } = useAuth();
  const { fetchAppointments, fetchAvailableSlots, addAvailableSlot, deleteAvailableSlot, updateAppointment, cancelAppointment } = useBooking();

  const TABS = isAdmin
    ? ["appointments", "users"]
    : ["appointments", "slots", "services"];

  const [tab, setTab] = useState("appointments");

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProvider, setFilterProvider] = useState("all");
  const [apptLoading, setApptLoading] = useState(false);

  // Slots
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toISO(today));
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Services
  const [services, setServices] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceModal, setServiceModal] = useState(null); // null | "new" | serviceObj

  // Users (admin only)
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userFilter, setUserFilter] = useState("all");

  const calDays = getMonthDays(viewYear, viewMonth);

  useEffect(() => {
    if (tab === "appointments") loadAppointments();
    if (tab === "slots") loadSlots();
    if (tab === "services") loadServices();
    if (tab === "users" && isAdmin) loadUsers();
  }, [tab]);

  useEffect(() => {
    if (tab === "slots") loadSlots();
  }, [selectedDate]);

  // ── Loaders ──────────────────────────────────────────────────────────────

  async function loadAppointments() {
    setApptLoading(true);
    try {
      const filters = isAdmin ? { all: true } : { providerId: user.id };
      const data = await fetchAppointments(filters);
      setAppointments(data);
    } finally { setApptLoading(false); }
  }

  async function loadSlots() {
    setSlotLoading(true);
    try {
      const data = await fetchAvailableSlots(user.id, selectedDate);
      setSlots(data);
    } finally { setSlotLoading(false); }
  }

  async function loadServices() {
    setServiceLoading(true);
    try {
      const res = await fetch(`${API}/services?userId=${user.id}`);
      const data = await res.json();
      setServices(data);
    } finally { setServiceLoading(false); }
  }

  async function loadUsers() {
    setUserLoading(true);
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsers(data);
    } finally { setUserLoading(false); }
  }

  // ── Appointments ─────────────────────────────────────────────────────────

  async function handleComplete(id) {
    try {
      const updated = await updateAppointment(id, { status: "completed" });
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, ...updated } : a));
    } catch (e) { alert("Hiba: " + e.message); }
  }

  async function handleCancelAppt(id) {
    if (!window.confirm("Biztosan le szeretnéd mondani?")) return;
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, ...updated } : a));
    } catch (e) { alert("Hiba: " + e.message); }
  }

  // ── Slots ────────────────────────────────────────────────────────────────

  async function handleAddSlot(time) {
    setAdding(true);
    try {
      const newSlot = await addAvailableSlot(user.id, { date: selectedDate, time });
      setSlots((prev) => [...prev, newSlot]);
    } catch (e) { alert("Hiba: " + e.message); }
    finally { setAdding(false); }
  }

  async function handleDeleteSlot(slotId) {
    try {
      await deleteAvailableSlot(slotId);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (e) { alert("Hiba: " + e.message); }
  }

  // ── Services ─────────────────────────────────────────────────────────────

  function handleServiceSaved(savedService, isEdit) {
    if (isEdit) {
      setServices((prev) => prev.map((s) => s.id === savedService.id ? savedService : s));
    } else {
      setServices((prev) => [...prev, savedService]);
    }
  }

  async function handleDeleteService(id) {
    if (!window.confirm("Biztosan törlöd ezt a szolgáltatást? A kapcsolódó foglalások is törlődnek!")) return;
    try {
      const res = await fetch(`${API}/services/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (e) { alert("Hiba: " + e.message); }
  }

  // ── Users (admin) ────────────────────────────────────────────────────────

  async function handleDeleteUser(userId) {
    const target = users.find((u) => u.id === userId);
    if (!window.confirm(`Biztosan törlöd ${target?.name} felhasználót? Minden adata (foglalások, időpontok, szolgáltatások) törlődik!`)) return;
    try {
      const res = await fetch(`${API}/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) { alert("Hiba: " + e.message); }
  }

  // ── Szűrések ─────────────────────────────────────────────────────────────

  if (!isProviderOrAdmin) {
    return (
      <div className="page">
        <div className="access-denied">
          <div className="denied-icon">🔒</div>
          <h2>Hozzáférés megtagadva</h2>
          <p>Ez az oldal csak szolgáltatók és adminok számára érhető el.</p>
        </div>
      </div>
    );
  }

  const providers = [...new Map(appointments.map((a) => [a.provider?.id, a.provider])).values()].filter(Boolean);
  const filteredAppts = appointments.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterProvider !== "all" && String(a.provider?.id) !== filterProvider) return false;
    return true;
  }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  const dayBookedTimes = appointments
    .filter((a) => a.date === selectedDate && a.providerId === user.id && a.status !== "cancelled")
    .map((a) => a.time);

  const filteredUsers = users.filter((u) => {
    if (userFilter === "all") return true;
    return u.role === userFilter;
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const TAB_LABELS = {
    appointments: "📋 Foglalások",
    slots: "🗓️ Időpontok",
    services: "✂️ Szolgáltatásaim",
    users: "👥 Felhasználók",
  };

  return (
    <div className="page admin-page">
      <div className="page-header">
        <h1>{isAdmin ? "Admin Panel" : "Saját panel"}</h1>
        <p className="page-subtitle">Üdv, {user?.name}! {isAdmin ? "Teljes hozzáféréssel rendelkezel." : `${user?.profession} – kezeld adataidat.`}</p>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── FOGLALÁSOK ── */}
      {tab === "appointments" && (
        <div className="admin-content">
          <div className="admin-section-header">
            <h2>Foglalások {isAdmin ? "(összes)" : "(saját)"}</h2>
            <div className="admin-filters">
              <div className="filter-tabs">
                {[{ key: "all", label: "Összes" }, { key: "confirmed", label: "Visszaigazolt" }, { key: "completed", label: "Teljesített" }, { key: "cancelled", label: "Lemondott" }].map((f) => (
                  <button key={f.key} className={`filter-tab ${filterStatus === f.key ? "active" : ""}`} onClick={() => setFilterStatus(f.key)}>{f.label}</button>
                ))}
              </div>
              {isAdmin && providers.length > 0 && (
                <select className="provider-filter-select" value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)}>
                  <option value="all">Összes szolgáltató</option>
                  {providers.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.profession})</option>)}
                </select>
              )}
            </div>
          </div>
          {apptLoading ? <div className="loading-state">Betöltés...</div>
          : filteredAppts.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><h3>Nincs megjeleníthető foglalás</h3></div>
          ) : (
            <div className="admin-appts-grid">
              {filteredAppts.map((a) => {
                const d = new Date(`${a.date}T${a.time}`);
                const si = STATUS_LABELS[a.status] || { label: a.status, cls: "" };
                return (
                  <div key={a.id} className={`admin-appt-card ${a.status}`}>
                    <div className="admin-appt-header">
                      <div className="admin-appt-datetime">
                        <span className="admin-appt-date">{d.toLocaleDateString("hu-HU", { month: "long", day: "numeric", weekday: "short" })}</span>
                        <span className="admin-appt-time">🕐 {d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <span className={`appt-status ${si.cls}`}>{si.label}</span>
                    </div>
                    <div className="admin-appt-body">
                      {isAdmin && a.provider && <div className="admin-provider-info"><span className="admin-provider-badge">✂️ {a.provider.name} ({a.provider.profession})</span></div>}
                      <div className="admin-client-info">
                        <strong>👤 {a.customer?.name || "–"}</strong>
                        <span className="admin-client-email">{a.customer?.email}</span>
                        {a.customer?.phonenumber && <span className="admin-client-phone">📞 {a.customer.phonenumber}</span>}
                      </div>
                      <div className="admin-service-info">
                        <span className="admin-service-name">{a.service?.name || "–"}</span>
                        {a.service?.duration && <span className="admin-service-duration">⏱ {a.service.duration} perc</span>}
                        {a.service?.price && <span className="admin-service-price">💰 {a.service.price} Ft</span>}
                      </div>
                      {a.note && <div className="admin-note">📝 {a.note}</div>}
                    </div>
                    {a.status === "confirmed" && (
                      <div className="admin-appt-actions">
                        <button className="btn-complete" onClick={() => handleComplete(a.id)}>✓ Teljesítve</button>
                        <button className="btn-cancel-admin" onClick={() => handleCancelAppt(a.id)}>✕ Lemondás</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── IDŐPONTOK ── */}
      {tab === "slots" && (
        <div className="admin-content">
          <div className="admin-section-header">
            <h2>Szabad időpontok – {user?.name}</h2>
            <p className="section-hint">Kattints egy napra, majd kezeld az időpontjaidat.</p>
          </div>
          <div className="calendar-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <span className="cal-month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="calendar-grid admin-calendar">
            {WEEKDAYS.map((wd) => <div key={wd} className="cal-weekday">{wd}</div>)}
            {calDays.map((date, i) => {
              const iso = date ? toISO(date) : null;
              const isSelected = iso === selectedDate;
              const isPast = date && date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <div key={i}
                  className={["cal-day", date ? "" : "empty", isSelected ? "selected" : "", isPast ? "past" : date ? "clickable" : ""].join(" ")}
                  onClick={() => { if (date && !isPast) setSelectedDate(iso); }}>
                  {date ? date.getDate() : ""}
                </div>
              );
            })}
          </div>
          <div className="section-label" style={{ marginTop: "1.5rem" }}>
            Időpontok – {new Date(selectedDate + "T12:00").toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </div>
          {slotLoading ? <div className="loading-state">Betöltés...</div> : (
            <>
              <div className="slots-legend-admin">
                <span><span className="legend-dot available"></span> Szabad</span>
                <span><span className="legend-dot booked"></span> Foglalt</span>
                <span><span className="legend-dot unavailable"></span> Nem elérhető</span>
              </div>
              <div className="admin-slots-grid">
                {ALL_TIMES.map((time) => {
                  const existing = slots.find((s) => s.time === time);
                  const isBooked = dayBookedTimes.includes(time);
                  return (
                    <div key={time} className={`admin-slot-item ${existing ? (isBooked ? "is-booked" : "has-slot") : ""}`}>
                      <span className="admin-slot-time">{time}</span>
                      {isBooked ? (
                        <span className="slot-booked-label">Foglalt</span>
                      ) : existing ? (
                        <button className="btn-remove-slot" onClick={() => handleDeleteSlot(existing.id)}>✕ Törlés</button>
                      ) : (
                        <button className="btn-add-slot" onClick={() => handleAddSlot(time)} disabled={adding}>+ Hozzáad</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SZOLGÁLTATÁSAIM ── */}
      {tab === "services" && (
        <div className="admin-content">
          <div className="admin-section-header">
            <h2>Saját szolgáltatásaim</h2>
            <button className="btn-new-service" onClick={() => setServiceModal("new")}>
              + Új szolgáltatás
            </button>
          </div>
          {serviceLoading ? <div className="loading-state">Betöltés...</div>
          : services.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✂️</div>
              <h3>Még nincs felvett szolgáltatásod</h3>
              <p>Kattints az „Új szolgáltatás" gombra a hozzáadáshoz!</p>
            </div>
          ) : (
            <div className="services-manage-grid">
              {services.map((s) => (
                <div key={s.id} className="service-manage-card">
                  <div className="smc-body">
                    <h3 className="smc-name">{s.name}</h3>
                    {s.description && <p className="smc-desc">{s.description}</p>}
                    <div className="smc-meta">
                      <span className="smc-duration">⏱ {s.duration} perc</span>
                      <span className="smc-price">💰 {s.price} Ft</span>
                    </div>
                  </div>
                  <div className="smc-actions">
                    <button className="btn-edit-service" onClick={() => setServiceModal(s)}>✏️ Szerkesztés</button>
                    <button className="btn-delete-service" onClick={() => handleDeleteService(s.id)}>🗑️ Törlés</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FELHASZNÁLÓK (admin only) ── */}
      {tab === "users" && isAdmin && (
        <div className="admin-content">
          <div className="admin-section-header">
            <h2>Felhasználók kezelése</h2>
            <div className="filter-tabs">
              {[{ key: "all", label: "Összes" }, { key: "CUSTOMER", label: "Ügyfelek" }, { key: "PROVIDER", label: "Szolgáltatók" }].map((f) => (
                <button key={f.key} className={`filter-tab ${userFilter === f.key ? "active" : ""}`} onClick={() => setUserFilter(f.key)}>{f.label}</button>
              ))}
            </div>
          </div>
          {userLoading ? <div className="loading-state">Betöltés...</div>
          : filteredUsers.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><h3>Nincs megjeleníthető felhasználó</h3></div>
          ) : (
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Név</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>Szerepkör</th>
                    <th>Szakma</th>
                    <th>Művelet</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={u.role === "ADMIN" ? "row-admin" : ""}>
                      <td className="td-id">{u.id}</td>
                      <td className="td-name">{u.name}</td>
                      <td className="td-email">{u.email}</td>
                      <td>{u.phonenumber}</td>
                      <td>
                        <span className={`user-role-badge role-${u.role?.toLowerCase()}`}>
                          {u.role === "ADMIN" ? "👑 Admin" : u.role === "PROVIDER" ? "✂️ Szolgáltató" : "👤 Ügyfél"}
                        </span>
                      </td>
                      <td>{u.profession || "–"}</td>
                      <td>
                        {u.role !== "ADMIN" ? (
                          <button className="btn-delete-user" onClick={() => handleDeleteUser(u.id)}>
                            🗑️ Törlés
                          </button>
                        ) : (
                          <span className="td-protected">Védett</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Szolgáltatás form modal */}
      {serviceModal && (
        <ServiceFormModal
          service={serviceModal === "new" ? null : serviceModal}
          userId={user.id}
          onClose={() => setServiceModal(null)}
          onSaved={handleServiceSaved}
        />
      )}
    </div>
  );
}
