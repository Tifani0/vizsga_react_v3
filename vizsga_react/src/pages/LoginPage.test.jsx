import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';    
import { expect, test } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { MemoryRouter } from 'react-router';
test("teszteset leírása", async () => {
  render(
  <AuthProvider>
    <MemoryRouter>
    <LoginPage/>

    </MemoryRouter>
  </AuthProvider>
    );
  const emailInput = screen.getByPlaceholderText("email@példa.hu");
  const passwordInput = screen.getByPlaceholderText("Jelszó");
  await userEvent.type(emailInput,"nagyannamari@gmail.com")
  await userEvent.type(passwordInput, "pass")
  const button = screen.getByRole("button", { name: "Bejelentkezés" });
  await userEvent.click(button);
  expect(screen.getByText("A jelszónak legalább 8 karakter hosszúnak kell lennie")).toBeInTheDocument();
})