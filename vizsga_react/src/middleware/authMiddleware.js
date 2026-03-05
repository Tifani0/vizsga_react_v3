import { redirect } from "react-router";

/**
 * Middleware a hitelesítés ellenőrzésére
 * Ha nincs token, átirányít a login oldalra
 */
async function authMiddleware({ request }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Ha nincs token, irányítsuk a login oldalra
    throw redirect("/login");
  }

  // Ha van token, a navigáció folytatódik
  // (Nem kell visszatérési érték)
}

export default authMiddleware;