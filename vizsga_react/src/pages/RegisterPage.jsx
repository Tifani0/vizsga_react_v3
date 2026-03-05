import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const PROFESSIONS = ["Fodrász", "Kozmetikus", "Műkörmös"];

function RegisterPage() {
  const [name, setName] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProvider, setIsProvider] = useState(false);
  const [profession, setProfession] = useState("");
  const [providerCode, setProviderCode] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const e = {};
    if (!name || name.length < 3) e.name = "A névnek legalább 3 karakter hosszúnak kell lennie";
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Érvénytelen email formátum";
    if (!phonenumber) e.phonenumber = "A telefonszám kötelező";
    if (!password || password.length < 8) e.password = "A jelszónak legalább 8 karakter hosszúnak kell lennie";
    if (password !== confirmPassword) e.confirmPassword = "A két jelszó nem egyezik";
    if (isProvider) {
      if (!profession) e.profession = "Válassz szakmát!";
      if (!providerCode) e.providerCode = "A szolgáltatói kód kötelező!";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    setServerError("");
    try {
      const result = await register(
        name, email, phonenumber, password,
        isProvider ? "PROVIDER" : "CUSTOMER",
        isProvider ? profession : undefined,
        isProvider ? providerCode : undefined
      );
      setSuccessMessage(result.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setField = (setter, field) => (e) => {
    setter(e.target.value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="page register-page">
      <div className="register-container">
        <h1>Regisztráció</h1>
        <p>Ingyenes regisztráció</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Teljes név</label>
            <input type="text" id="name" value={name} onChange={setField(setName, "name")}
              className={errors.name ? "input-error" : ""} placeholder="Kovács János" disabled={loading} />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phonenumber">Telefonszám</label>
            <input type="text" id="phonenumber" value={phonenumber} onChange={setField(setPhonenumber, "phonenumber")}
              className={errors.phonenumber ? "input-error" : ""} placeholder="06 12 345 6789" disabled={loading} />
            {errors.phonenumber && <span className="error-text">{errors.phonenumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email cím</label>
            <input type="email" id="email" value={email} onChange={setField(setEmail, "email")}
              className={errors.email ? "input-error" : ""} placeholder="email@példa.hu" disabled={loading} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Jelszó</label>
            <input type="password" id="password" value={password} onChange={setField(setPassword, "password")}
              className={errors.password ? "input-error" : ""} placeholder="Legalább 8 karakter" disabled={loading} />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Jelszó megerősítése</label>
            <input type="password" id="confirmPassword" value={confirmPassword}
              onChange={setField(setConfirmPassword, "confirmPassword")}
              className={errors.confirmPassword ? "input-error" : ""} placeholder="Jelszó újra" disabled={loading} />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          {/* Szolgáltató checkbox */}
          <div className="form-group provider-toggle">
            <label className="checkbox-label">
              <input type="checkbox" checked={isProvider} onChange={(e) => { setIsProvider(e.target.checked); setErrors({}); }} disabled={loading} />
              <span>Szolgáltatóként regisztrálok (fodrász, kozmetikus, műkörmös)</span>
            </label>
          </div>

          {isProvider && (
            <div className="provider-fields">
              <div className="provider-notice">
                <span className="provider-notice-icon">ℹ️</span>
                Szolgáltatói regisztrációhoz egyedi kód szükséges. Ha még nem rendelkezel vele, kérj egyet a szalonodtól!
              </div>

              <div className="form-group">
                <label htmlFor="profession">Szakma</label>
                <select id="profession" value={profession} onChange={setField(setProfession, "profession")}
                  className={errors.profession ? "input-error" : ""} disabled={loading}>
                  <option value="">-- Válassz szakmát --</option>
                  {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.profession && <span className="error-text">{errors.profession}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="providerCode">Szolgáltatói kód</label>
                <input type="password" id="providerCode" value={providerCode}
                  onChange={setField(setProviderCode, "providerCode")}
                  className={errors.providerCode ? "input-error" : ""} placeholder="••••••••••" disabled={loading} />
                {errors.providerCode && <span className="error-text">{errors.providerCode}</span>}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Regisztráció..." : "Regisztráció"}
          </button>
        </form>

        <p className="login-link">
          Már van fiókod? <Link to="/login">Jelentkezz be!</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
