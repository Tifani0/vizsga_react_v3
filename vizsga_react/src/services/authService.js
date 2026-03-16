const API = "http://localhost:3000";

export const login = async (email, password) => {
  const response = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Hibás email vagy jelszó");
  return { user: data.user, token: data.token };
};
export const register = async (name, email, phonenumber, password, role, profession, providerCode) => {
  const response = await fetch(`${API}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phonenumber, password, role, profession, providerCode }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Hiba történt a regisztráció során");
  }
  return { success: true, message: "Sikeres regisztráció! Most már bejelentkezhetsz." };
};

export const logout = async () => {
  return { success: true };
};
