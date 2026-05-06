import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../features/trip/Dashboard';

beforeEach(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'token') return 'fake-token';
    if (key === 'user') return JSON.stringify({
      first_name: 'Test',
      last_name: 'User'
    });
    return null;
  });
});

describe('Dashboard Page', () => {
  test('renders welcome message', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test('renders Plan New Trip button', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/plan new trip/i)).toBeInTheDocument();
  });

  test('renders Total Trips card', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/total trips/i)).toBeInTheDocument();
  });

  test('renders Overall Expense card', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/overall expense/i)).toBeInTheDocument();
  });
});