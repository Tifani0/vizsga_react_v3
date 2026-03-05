import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { BookingProvider } from "./contexts/BookingContext";
import Layout from "./components/Layout";
import authMiddleware from "./middleware/authMiddleware";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import Services from "./pages/Services";
import Hairservices from "./pages/Hairservices";
import ServicesBeauty from "./pages/Beautyservices";
import ServicesNail from "./pages/Nailservices";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import AdminPage from "./pages/AdminPage";
import "bootstrap/dist/css/bootstrap.min.css";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: <Layout />,
    middleware: [authMiddleware],
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "szolgáltatások", element: <Services /> },
      { path: "/fodraszok", element: <Hairservices /> },
      { path: "/kozmetikusok", element: <ServicesBeauty /> },
      { path: "/mukormosok", element: <ServicesNail /> },
      { path: "/foglalasaim", element: <MyAppointmentsPage /> },
      { path: "/admin", element: <AdminPage /> },
    ],
  },
  { path: "*", element: <div style={{ padding: "2rem", textAlign: "center" }}><h1>404 – Az oldal nem található</h1><a href="/login">Vissza</a></div> },
]);

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <RouterProvider router={router} />
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
