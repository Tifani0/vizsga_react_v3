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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </button>
        </form>
        <p className="register-link">
          Még nincs fiókod? <Link to="/register">Regisztrálj ingyen!</Link>
        </p>
        <p style={{ fontSize: "0.875rem", color: "#a10372" }}>
            <strong>Teszt bejelentkezés:</strong>
            <br />
            Email: valami@gmail.com
            <br />
            Jelszó: password123
          </p>
      </div>
    </div>
  );
}

export default LoginPage;