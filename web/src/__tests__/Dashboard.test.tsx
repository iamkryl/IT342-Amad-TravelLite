import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    data: {
      data: {
        totalTrips: 5,
        overallExpense: 10000,
        upcomingTravelsCount: 2,
        firstName: 'Test',
        lastName: 'User',
        photoUrl: null,
        data: []
      }
    }
  })),
  post: jest.fn(() => Promise.resolve({ data: { data: [] } })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(),
  defaults: { headers: { common: {} } }
}));

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

import Dashboard from '../features/trip/Dashboard';

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