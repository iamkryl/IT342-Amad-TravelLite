import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../features/user/Profile';

describe('Profile Page', () => {
  test('renders Profile Settings heading', () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    expect(screen.getByText(/profile settings/i)).toBeInTheDocument();
  });

  test('renders Personal Information section', () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    expect(screen.getByText(/personal information/i)).toBeInTheDocument();
  });

  test('renders Upload Photo button', () => {
    render(<MemoryRouter><Profile /></MemoryRouter>);
    expect(screen.getByText(/upload photo/i)).toBeInTheDocument();
  });

  test('renders Change Password section', () => {
  render(<MemoryRouter><Profile /></MemoryRouter>);
  expect(screen.getAllByText(/change password/i).length).toBeGreaterThan(0);
});
});