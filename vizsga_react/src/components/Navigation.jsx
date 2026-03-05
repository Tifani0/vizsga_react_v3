import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function Navigation() {
  const { user, logout, isProviderOrAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Biztosan ki szeretnél jelentkezni?")) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-brand"><h2>Book & Beauty</h2></div>
      <div className="nav-links">
        <span className="user-greeting">Szia, {user?.name || "Felhasználó"}!</span>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
        <NavLink to="/szolgáltatások" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Szolgáltatások</NavLink>
        <NavLink to="/foglalasaim" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Foglalásaim</NavLink>
        {isProviderOrAdmin && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active nav-link-admin" : "nav-link nav-link-admin"}>
            {user?.role === "ADMIN" ? "Admin" : "Saját panel"}
          </NavLink>
        )}
        <button onClick={handleLogout} className="btn btn-secondary">Kijelentkezés</button>
      </div>
    </nav>
  );
}

export default Navigation;
