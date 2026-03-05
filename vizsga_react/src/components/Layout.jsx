import { Outlet } from "react-router";
import Navigation from "./Navigation";

function Layout() {
  return (
    <div className="layout">
      <Navigation />

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2025 Book & Beauty. Minden jog fenntartva.</p>
      </footer>
    </div>
  );
}

export default Layout;