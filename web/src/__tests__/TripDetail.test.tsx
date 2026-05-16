import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    data: {
      data: {
        tripId: 1,
        title: 'Test Trip',
        destination: 'Boracay',
        origin: 'Manila',
        startDate: '2026-08-01',
        endDate: '2026-08-07',
        duration: 6,
        totalExpenses: 5000,
        createdBy: 1,
        budgetItems: [{ budgetId: 1, category: 'Food', amount: 5000 }],
        places: [{ placeId: 1, name: 'White Beach' }],
        checklistItems: [{ itemId: 1, name: 'Sunscreen', isChecked: false }],
        companions: [{ companionId: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane@gmail.com' }]
      }
    }
  })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
}));

beforeEach(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'token') return 'fake-token';
    if (key === 'user') return JSON.stringify({ id: 1, first_name: 'Test', last_name: 'User', photo_url: null });
    return null;
  });
});

import TripDetail from '../features/trip/TripDetail';

describe('TripDetail Page', () => {
  const renderTripDetail = () =>
    render(
      <MemoryRouter initialEntries={['/trips/1']}>
        <Routes>
          <Route path="/trips/:id" element={<TripDetail />} />
        </Routes>
      </MemoryRouter>
    );

  test('renders loading state initially', () => {
    renderTripDetail();
    expect(screen.getByText(/loading trip details/i)).toBeInTheDocument();
  });

  test('renders TripDetail page without crashing', () => {
    renderTripDetail();
    expect(document.body).toBeInTheDocument();
  });
});