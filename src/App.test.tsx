import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

test('renders main app and checks for Tailwind class', () => {
  render(<App />);
  // Check for the main heading or root element
  const mainElement = screen.getByRole('main');
  expect(mainElement).not.toBeNull();
  // Check for a Tailwind class (e.g., bg-white)
  expect(mainElement.className).toMatch(/bg|flex|container/);
}); 