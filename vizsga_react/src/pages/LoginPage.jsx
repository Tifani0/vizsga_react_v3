import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
    // Form mezők state-jei (controlled inputs)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hiba kezelés
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState("login");
const [forgotEmail, setForgotEmail] = useState("");
const [resetCode, setResetCode] = useState("");
const [generatedCode, setGeneratedCode] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmNewPassword, setConfirmNewPassword] = useState("");
const [forgotMsg, setForgotMsg] = useState("");
const [forgotError, setForgotError] = useState("");
const [forgotLoading, setForgotLoading] = useState(false);
const API = "http://localhost:3000";

  // Ha már be van jelentkezve, irányítsuk a dashboard-ra
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Client-side form validáció
  const validateForm = () => {
    const newErrors = {};

     // Email validáció
    if (!email) {
      newErrors.email = "Az email cím kötelező";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Érvénytelen email formátum";
    }

    // Jelszó validáció
    if (!password) {
      newErrors.password = "A jelszó kötelező";
    } else if (password.length < 8) {
      newErrors.password =
        "A jelszónak legalább 8 karakter hosszúnak kell lennie";
    }

    return newErrors;

  };
  // Form elküldés kezelése
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Validáció
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Login API hívás (mock service az AuthContext-en keresztül)
    setLoading(true);
    try {
      await login(email, password);
      // Sikeres login után navigáció a komponensben!
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e) => {
  e.preventDefault();
  setForgotError(""); setForgotMsg("");
  if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) { setForgotError("Adj meg egy érvényes email címet!"); return; }
  setForgotLoading(true);
  try {
    const res = await fetch(`${API}/users`);
    const users = await res.json();
    const exists = users.find((u) => u.email === forgotEmail);
    if (!exists) { setForgotError("Nem található felhasználó ezzel az email címmel."); return; }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setForgotMsg(`A kód: ${code} (valós alkalmazásban ezt emailben kapnád meg)`);
    setView("reset");
  } catch { setForgotError("Hiba történt, próbáld újra."); }
  finally { setForgotLoading(false); }
};

const handleResetPassword = async (e) => {
  e.preventDefault();
  setForgotError("");
  if (resetCode !== generatedCode) { setForgotError("Hibás kód! Kérj újat."); return; }
  if (!newPassword || newPassword.length < 8) { setForgotError("A jelszónak legalább 8 karakter hosszúnak kell lennie."); return; }
  if (newPassword !== confirmNewPassword) { setForgotError("A két jelszó nem egyezik."); return; }
  setForgotLoading(true);
  try {
    const res = await fetch(`${API}/users/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) { setForgotError(data.error); return; }
    setForgotMsg("Jelszó sikeresen megváltoztatva!");
    setTimeout(() => { setView("login"); setForgotMsg(""); setForgotEmail(""); setResetCode(""); setNewPassword(""); setConfirmNewPassword(""); }, 2500);
  } catch { setForgotError("Hiba történt, próbáld újra."); }
  finally { setForgotLoading(false); }
};

if (view === "forgot") return (
  <div className="page login-page">
    <div className="login-container">
      <h1>Jelszó visszaállítás</h1>
      <p>Add meg az email címed és küldünk egy visszaállító kódot.</p>
      {forgotError && <div className="alert alert-error">{forgotError}</div>}
      {forgotMsg && <div className="alert alert-success">{forgotMsg}</div>}
      <form className="login-form" onSubmit={handleRequestCode}>
        <div className="form-group">
          <label>Email cím</label>
          <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="email@példa.hu" disabled={forgotLoading} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={forgotLoading}>{forgotLoading ? "Küldés..." : "Kód kérése"}</button>
      </form>
      <button type="button" className="forgot-link" onClick={() => setView("login")}>← Vissza a bejelentkezéshez</button>
    </div>
  </div>
);

if (view === "reset") return (
  <div className="page login-page">
    <div className="login-container">
      <h1>Új jelszó beállítása</h1>
      {forgotError && <div className="alert alert-error">{forgotError}</div>}
      {forgotMsg && <div className="alert alert-success">{forgotMsg}</div>}
      <form className="login-form" onSubmit={handleResetPassword}>
        <div className="form-group">
          <label>Visszaállító kód</label>
          <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="6 jegyű kód" disabled={forgotLoading} />
        </div>
        <div className="form-group">
          <label>Új jelszó</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Legalább 8 karakter" disabled={forgotLoading} />
        </div>
        <div className="form-group">
          <label>Új jelszó megerősítése</label>
          <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Jelszó újra" disabled={forgotLoading} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={forgotLoading}>{forgotLoading ? "Mentés..." : "Jelszó megváltoztatása"}</button>
      </form>
      <button type="button" className="forgot-link" onClick={() => setView("forgot")}>← Új kód kérése</button>
    </div>
  </div>
);

  return (
   <div className="page login-page">
      <div className="login-container">
        <h1>Bejelentkezés</h1>
        <p>Üdvözöljük a Book & Beauty oldalon!</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form className="login-form" onSubmit={handleSubmit} >
          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input type="email" id="email"  name="email"  value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Töröljük a hibaüzenetet, ha a user módosítja a mezőt
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              className={errors.email ? "input-error" : ""}
              placeholder="email@példa.hu"
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input type="password" id="password" name="password" value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Töröljük a hibaüzenetet, ha a user módosítja a mezőt
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              className={errors.password ? "input-error" : ""}
              placeholder="Jelszó"
              disabled={loading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>
          <button type="button" className="forgot-link" onClick={() => { setView("forgot"); setForgotError(""); setForgotMsg(""); }}>
          Elfelejtettem a jelszavam
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </button>
        </form>
        <p className="register-link">
          Még nincs fiókod? <Link to="/register">Regisztrálj ingyen!</Link>
        </p>
        <p style={{ fontSize: "0.875rem", color: "#a10372" }}>
            <strong>Teszt bejelentkezés Adminként:</strong>
            <br />
            Email: admin@bookbeauty.hu
            <br />
            Jelszó: Admin1234!
          </p>
      </div>
    </div>
  );
}

export default LoginPage;