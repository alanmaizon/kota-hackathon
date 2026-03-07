import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeScreen } from '../components/WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders the heading', () => {
    render(<WelcomeScreen onStart={() => {}} />);
    expect(screen.getByText(/find the right health plan/i)).toBeDefined();
  });

  it('renders the CTA button', () => {
    render(<WelcomeScreen onStart={() => {}} />);
    expect(screen.getByText(/find your plan/i)).toBeDefined();
  });

  it('calls onStart when button is clicked', () => {
    let clicked = false;
    render(<WelcomeScreen onStart={() => { clicked = true; }} />);
    fireEvent.click(screen.getByText(/find your plan/i));
    expect(clicked).toBe(true);
  });

  it('shows benefit cards', () => {
    render(<WelcomeScreen onStart={() => {}} />);
    expect(screen.getByText(/AI-powered matching/i)).toBeDefined();
    expect(screen.getAllByText(/60 seconds/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/personalised insights/i)).toBeDefined();
    expect(screen.getByText(/built for teams/i)).toBeDefined();
  });

  it('shows trust indicators', () => {
    render(<WelcomeScreen onStart={() => {}} />);
    expect(screen.getByText(/no signup required/i)).toBeDefined();
    expect(screen.getByText(/trusted by teams at/i)).toBeDefined();
  });
});
