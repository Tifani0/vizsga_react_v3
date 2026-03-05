import { useState, useEffect } from "react";
import { useBooking } from "../contexts/BookingContext";
import { useAuth } from "../contexts/AuthContext";

// Hónap napjainak generálása
function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  // Hét első napja: hétfő (1) → vasárnap (0)
  let startDow = firstDay.getDay(); // 0=V,1=H...6=Sz
  startDow = startDow === 0 ? 6 : startDow - 1; // átalakítás: H=0 ... V=6
  for (let i = 0; i < startDow; i++) days.push(null); // üres cellák
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const MONTH_NAMES = ["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"];

export default function BookingModal({ professional, service, onClose, onSuccess }) {
  const { user } = useAuth();
  const { fetchAvailableSlots, fetchAppointments, createAppointment } = useBooking();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const [slotsByDate, setSlotsByDate] = useState({}); // date → slots[]
  const [bookedByDate, setBookedByDate] = useState({}); // date → booked[]
  const [loadingMonth, setLoadingMonth] = useState(false);

  const [selectedTime, setSelectedTime] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const days = getMonthDays(viewYear, viewMonth);

  // Hónap váltásakor betöltjük az összes szabad / foglalt időpontot
  useEffect(() => {
    loadMonth();
  }, [viewYear, viewMonth, professional.id]);

  async function loadMonth() {
    setLoadingMonth(true);
    setSelectedDate(null);
    setSelectedTime(null);
    try {
      // Összes slot ebben a hónapban
      const allSlots = await fetchAvailableSlots(professional.id);
      const allAppts = await fetchAppointments({ providerId: professional.id });

      const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
      const filteredSlots = allSlots.filter((s) => s.date.startsWith(monthStr));
      const filteredAppts = allAppts.filter((a) => a.date.startsWith(monthStr) && a.status !== "cancelled");

      // Csoportosítás dátum szerint
      const sbd = {};
      filteredSlots.forEach((s) => {
        if (!sbd[s.date]) sbd[s.date] = [];
        sbd[s.date].push(s);
      });
      const bbd = {};
      filteredAppts.forEach((a) => {
        if (!bbd[a.date]) bbd[a.date] = [];
        bbd[a.date].push(a);
      });
      setSlotsByDate(sbd);
      setBookedByDate(bbd);
    } finally {
      setLoadingMonth(false);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function getDayStatus(date) {
    if (!date) return null;
    const iso = toISO(date);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isPast) return "past";
    const slots = slotsByDate[iso] || [];
    const booked = bookedByDate[iso] || [];
    const freeSlots = slots.filter((s) => !booked.some((b) => b.time === s.time));
    if (slots.length === 0) return "no-slots";
    if (freeSlots.length === 0) return "full";
    return "has-slots";
  }

  function handleDayClick(date) {
    if (!date) return;
    const status = getDayStatus(date);
    if (status === "past" || status === "no-slots" || status === "full") return;
    setSelectedDate(toISO(date));
    setSelectedTime(null);
  }

  // Kiválasztott naphoz időpontok
  const daySlots = selectedDate ? (slotsByDate[selectedDate] || []) : [];
  const dayBooked = selectedDate ? (bookedByDate[selectedDate] || []) : [];
  const freeTimes = daySlots
    .filter((s) => !dayBooked.some((b) => b.time === s.time))
    .map((s) => s.time)
    .sort();
  const bookedTimes = daySlots
    .filter((s) => dayBooked.some((b) => b.time === s.time))
    .map((s) => s.time)
    .sort();

  async function handleBooking() {
    if (!selectedTime || !selectedDate) return;
    setSubmitting(true);
    try {
      await createAppointment({
        customerId: user.id,
        providerId: professional.id,
        serviceId: service.id,
        date: selectedDate,
        time: selectedTime,
        note: note.trim() || null,
      });
      setSuccess(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
    } catch (e) {
      alert("Hiba: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="booking-modal">
        {success ? (
          <div className="booking-success">
            <div className="success-icon">✓</div>
            <h3>Sikeres foglalás!</h3>
            <p>
              <strong>{professional.name}</strong> – {service.name}
              <br />
              {new Date(selectedDate).toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" })}, {selectedTime}
            </p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Időpont foglalás</h2>
                <p className="modal-subtitle">
                  <span className="badge-professional">{professional.name}</span>
                  <span className="badge-service">{service.name}</span>
                  <span className="badge-duration">⏱ {service.duration} perc</span>
                  <span className="badge-price">💰 {service.price} Ft</span>
                </p>
              </div>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <div className="modal-body">
              {/* Naptár */}
              <div className="calendar-nav">
                <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                <span className="cal-month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                <button className="cal-nav-btn" onClick={nextMonth}>›</button>
              </div>

              {loadingMonth ? (
                <div className="slots-loading">Betöltés...</div>
              ) : (
                <>
                  <div className="calendar-legend">
                    <span><span className="cal-dot has-slots"></span>Szabad</span>
                    <span><span className="cal-dot full"></span>Teli</span>
                    <span><span className="cal-dot no-slots"></span>Nincs időpont</span>
                  </div>

                  <div className="calendar-grid">
                    {WEEKDAYS.map((wd) => (
                      <div key={wd} className="cal-weekday">{wd}</div>
                    ))}
                    {days.map((date, i) => {
                      const status = getDayStatus(date);
                      const iso = date ? toISO(date) : null;
                      const isSelected = iso === selectedDate;
                      return (
                        <div
                          key={i}
                          className={[
                            "cal-day",
                            date ? status : "empty",
                            isSelected ? "selected" : "",
                            date && status !== "past" && status !== "no-slots" && status !== "full" ? "clickable" : "",
                          ].join(" ")}
                          onClick={() => handleDayClick(date)}
                          title={
                            status === "has-slots" ? "Szabad időpontok vannak"
                            : status === "full" ? "Minden időpont foglalt"
                            : status === "no-slots" ? "Nincs meghirdetett időpont"
                            : ""
                          }
                        >
                          {date ? date.getDate() : ""}
                          {date && status === "has-slots" && (
                            <span className="cal-dot-inline has-slots"></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Időpont választó a kiválasztott naphoz */}
              {selectedDate && (
                <>
                  <div className="section-label" style={{ marginTop: "1.25rem" }}>
                    Időpontok – {new Date(selectedDate + "T12:00").toLocaleDateString("hu-HU", { month: "long", day: "numeric", weekday: "long" })}
                    <span className="slot-legend">
                      <span className="legend-dot available"></span> Szabad
                      <span className="legend-dot booked"></span> Foglalt
                    </span>
                  </div>
                  <div className="slots-grid">
                    {freeTimes.map((time) => (
                      <button key={time}
                        className={`slot-btn available ${selectedTime === time ? "selected" : ""}`}
                        onClick={() => setSelectedTime(time)}>
                        {time}
                      </button>
                    ))}
                    {bookedTimes.map((time) => (
                      <button key={time} className="slot-btn booked" disabled title="Már foglalt">
                        {time}<span className="slot-x">✕</span>
                      </button>
                    ))}
                    {freeTimes.length === 0 && bookedTimes.length === 0 && (
                      <p className="no-slots-msg">Nincs megjeleníthető időpont.</p>
                    )}
                  </div>
                </>
              )}

              {/* Megjegyzés */}
              <div className="section-label">Megjegyzés (opcionális)</div>
              <textarea className="booking-note"
                placeholder="Pl. allergiainfo, speciális kérés..."
                value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>

            <div className="modal-footer">
              <div className="selected-summary">
                {selectedTime
                  ? <>Kiválasztva: <strong>{new Date(selectedDate + "T12:00").toLocaleDateString("hu-HU", { month: "long", day: "numeric" })} {selectedTime}</strong></>
                  : selectedDate ? "Válassz szabad időpontot!"
                  : "Kattints egy napra a naptárban!"}
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={onClose}>Mégsem</button>
                <button className="btn-book" disabled={!selectedTime || submitting} onClick={handleBooking}>
                  {submitting ? "Foglalás..." : "Megerősítés"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
