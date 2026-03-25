import { render, screen } from '@testing-library/react';
import App from './App';
import { expect, test } from 'vitest';

test('az alkalmazás betölt', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});