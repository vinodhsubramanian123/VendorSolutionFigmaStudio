/**
 * Category 2 — PlaywrightConsole Component Tests
 * Validates the Playwright Automation Console renders correctly in VendorPortal.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlaywrightConsole } from '../PlaywrightConsole';

// Mock framer-motion to prevent requestAnimationFrame hanging in JSDOM
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('PlaywrightConsole', () => {
  it('renders the terminal header and idle state', () => {
    render(<PlaywrightConsole />);
    expect(screen.getByText(/Playwright Automation Console/i)).toBeInTheDocument();
    expect(screen.getByText(/System idle/i)).toBeInTheDocument();
  });

  it('shows RUN SCRAPER button in idle state', () => {
    render(<PlaywrightConsole />);
    expect(screen.getByText(/RUN SCRAPER/i)).toBeInTheDocument();
    expect(screen.queryByText(/STOP SCRAPER/i)).not.toBeInTheDocument();
  });

  it('switches to STOP SCRAPER when agent starts', async () => {
    render(<PlaywrightConsole />);
    fireEvent.click(screen.getByText(/RUN SCRAPER/i));
    expect(screen.getByText(/STOP SCRAPER/i)).toBeInTheDocument();
  });

  it('shows terminal log lines after starting', async () => {
    render(<PlaywrightConsole />);
    fireEvent.click(screen.getByText(/RUN SCRAPER/i));

    // Wait for log lines to appear (interval is 800ms)
    // JSDOM timers can sometimes skip the first tick or race, so we accept either the first or second line
    await waitFor(() => {
      const found = screen.queryByText(/Starting Playwright/i) || screen.queryByText(/Navigating to partner OEM/i);
      expect(found).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('stops scraping and returns to idle after clicking STOP SCRAPER', async () => {
    render(<PlaywrightConsole />);
    
    fireEvent.click(screen.getByText(/RUN SCRAPER/i));
    expect(screen.getByText(/STOP SCRAPER/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/STOP SCRAPER/i));
    expect(screen.getByText(/RUN SCRAPER/i)).toBeInTheDocument();
  });

  it('clears previous logs when restarting the scraper', async () => {
    render(<PlaywrightConsole />);
    
    fireEvent.click(screen.getByText(/RUN SCRAPER/i));
    
    await waitFor(() => {
      const found = screen.queryByText(/Starting Playwright/i) || screen.queryByText(/Navigating to partner OEM/i);
      expect(found).toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.click(screen.getByText(/STOP SCRAPER/i));
    fireEvent.click(screen.getByText(/RUN SCRAPER/i));
    
    // Logs should be cleared immediately on click
    expect(screen.queryByText(/Starting Playwright/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Navigating to partner OEM/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/System idle/i)).not.toBeInTheDocument();
  });
});
