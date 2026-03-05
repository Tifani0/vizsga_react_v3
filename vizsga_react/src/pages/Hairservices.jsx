import { useEffect, useState } from "react";
import BookingModal from "../components/BookingModal";

export default function ServicesHair() {
  const [professionals, setProfessionals] = useState([]);
  const [bookingTarget, setBookingTarget] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/hairdressers")
      .then((r) => r.json())
      .then(setProfessionals);
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Fodrász szolgáltatások</h1>
        <p className="page-subtitle">Válassz fodrászt és foglalj időpontot!</p>
      </div>
      <div className="professionals-grid">
        {professionals.map((prof) => (
          <div className="professional-card" key={prof.id}>
            <div className="professional-card-header">
              <div className="professional-avatar">{prof.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h3 className="professional-name">{prof.name}</h3>
                <span className="professional-type-badge ">Fodrász</span>
              </div>
            </div>
            <div className="services-list">
              {prof.services?.map((service) => (
                <div className="service-item" key={service.id}>
                  <div className="service-item-info">
                    <span className="service-item-name">{service.name}</span>
                    {service.description && <span className="service-item-desc">{service.description}</span>}
                    <div className="service-item-meta">
                      <span className="service-item-duration">⏱ {service.duration} perc</span>
                      <span className="service-item-price">💰 {service.price} Ft</span>
                    </div>
                  </div>
                  <button className="btn-book-service"
                    onClick={() => setBookingTarget({ professional: { ...prof, type: "Fodrász" }, service })}>
                    Foglalás
                  </button>
                </div>
              ))}
              {(!prof.services || prof.services.length === 0) && (
                <p className="no-services-msg">Jelenleg nincs meghirdetett szolgáltatás.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {bookingTarget && (
        <BookingModal
          professional={bookingTarget.professional}
          service={bookingTarget.service}
          onClose={() => setBookingTarget(null)}
          onSuccess={() => setBookingTarget(null)}
        />
      )}
    </>
  );
}
