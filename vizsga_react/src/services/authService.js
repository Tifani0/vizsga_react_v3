const API = "http://localhost:3000";

export const login = async (email, password) => {
  const users = await fetch(`${API}/users`).then((r) => r.json());
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("Hibás email vagy jelszó");
  if (user.password !== password) throw new Error("Hibás email vagy jelszó");
  const token = `mock-token-${user.id}-${Date.now()}`;
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
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
