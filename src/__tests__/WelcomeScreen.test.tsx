import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeScreen } from '../components/WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders the heading', () => {
    render(<WelcomeScreen onStart={() => {}} />);
    expect(screen.getByText(/find your perfect/i)).toBeDefined();
  });

  it('renders the CTA button', () => {
    render(<WelcomeScreen onStart={() => {}} />);
    expect(screen.getByText(/find my plan/i)).toBeDefined();
  });

  it('calls onStart when button is clicked', () => {
    let clicked = false;
    render(<WelcomeScreen onStart={() => { clicked = true; }} />);
    fireEvent.click(screen.getByText(/find my plan/i));
    expect(clicked).toBe(true);
  });

  it('shows key feature pills', () => {
    render(<WelcomeScreen onStart={() => {}} />);
    expect(screen.getByText(/2 minutes/i)).toBeDefined();
    expect(screen.getByText(/AI-powered/i)).toBeDefined();
    // "Personalised" appears in multiple places, use getAllByText
    const personalisedEls = screen.getAllByText(/personalised/i);
    expect(personalisedEls.length).toBeGreaterThan(0);
    expect(screen.getByText(/no signup/i)).toBeDefined();
  });
});
