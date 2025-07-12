import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

test('renders main app with map and layout', () => {
  render(<App />);
  
  // Check for the main app title
  const titleElement = screen.getByText('Google Timeline Map');
  expect(titleElement).not.toBeNull();
  
  // Check for the sidebar tools
  const searchButton = screen.getByText('Search');
  expect(searchButton).not.toBeNull();
  
  const uploadButton = screen.getByText('Upload Data');
  expect(uploadButton).not.toBeNull();
  
  // Check for boundaries section
  const boundariesText = screen.getByText('No boundaries drawn yet');
  expect(boundariesText).not.toBeNull();
}); 