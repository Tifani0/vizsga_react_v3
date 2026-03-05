import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const PROVIDER_SECRET = "BookBeauty2025!";

function DashboardPage() {
  const { user, isProvider, isAdmin } = useAuth();
  const [codeVisible, setCodeVisible] = useState(false);

  return (
    <div className="page dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-welcome">
          <h1>Üdvözöljük, {user?.name}! 👋</h1>
          <p className="dashboard-tagline">Ahol a szépség a legfontosabb!</p>
          <div className="dashboard-meta">
            <span className="dashboard-meta-item">✉️ {user?.email}</span>
            <span className={`dashboard-role-badge role-${user?.role?.toLowerCase()}`}>
              {user?.role === "ADMIN" ? "👑 Admin" : user?.role === "PROVIDER" ? `✂️ ${user?.profession}` : "👤 Ügyfél"}
            </span>
          </div>
        </div>
      </div>

      {/* Szolgáltatói kód – csak PROVIDER-eknek */}
      {isProvider && (
        <div className="provider-code-card">
          <div className="provider-code-header">
            <div className="provider-code-icon">🔑</div>
            <div>
              <h3>Szolgáltatói belépési kód</h3>
              <p>Ezt a kódot add meg új kollégáknak, hogy szolgáltatóként tudjanak regisztrálni.</p>
            </div>
          </div>
          <div className="provider-code-body">
            <div className="code-display">
              <span className="code-value">{codeVisible ? PROVIDER_SECRET : "••••••••••••••"}</span>
              <button
                className="code-toggle-btn"
                onClick={() => setCodeVisible((v) => !v)}
                title={codeVisible ? "Elrejtés" : "Megjelenítés"}
              >
                {codeVisible ? "🙈 Elrejtés" : "👁 Megjelenítés"}
              </button>
              {codeVisible && (
                <button
                  className="code-copy-btn"
                  onClick={() => { navigator.clipboard.writeText(PROVIDER_SECRET); alert("Kód másolva!"); }}
                >
                  📋 Másolás
                </button>
              )}
            </div>
            <p className="code-warning">⚠️ Ne oszd meg nyilvánosan – csak megbízható kollégáknak add át!</p>
          </div>
        </div>
      )}

      {/* Admin info kártya */}
      {isAdmin && (
        <div className="admin-info-card">
          <div className="admin-info-icon">👑</div>
          <div>
            <h3>Admin hozzáférés</h3>
            <p>Teljes rendszer hozzáféréssel rendelkezel. Az Admin panelben kezelheted a felhasználókat, foglalásokat és időpontokat.</p>
          </div>
        </div>
      )}

      {/* Gyors linkek */}
      <div className="dashboard-quick-links">
        <h2>Gyors elérés</h2>
        <div className="quick-links-grid">
          <a href="/szolgáltatások" className="quick-link-card">
            <span className="quick-link-icon">💅</span>
            <span className="quick-link-label">Szolgáltatások</span>
          </a>
          <a href="/foglalasaim" className="quick-link-card">
            <span className="quick-link-icon">📅</span>
            <span className="quick-link-label">Foglalásaim</span>
          </a>
          {(isProvider || isAdmin) && (
            <a href="/admin" className="quick-link-card highlight">
              <span className="quick-link-icon">{isAdmin ? "👑" : "🗂️"}</span>
              <span className="quick-link-label">{isAdmin ? "Admin panel" : "Saját panel"}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
