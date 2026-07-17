import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from '../components/layout/BottomNav';
import { AppHeader } from '../components/layout/AppHeader';
import { SOSButton } from '../components/layout/SOSButton';

describe('Layout Components', () => {
  describe('BottomNav', () => {
    it('renders all 5 navigation tabs', () => {
      const handleChange = vi.fn();
      render(<BottomNav active="home" onChange={handleChange} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Navigate')).toBeInTheDocument();
      expect(screen.getByText('Translate')).toBeInTheDocument();
      expect(screen.getByText('Match')).toBeInTheDocument();
      expect(screen.getByText('More')).toBeInTheDocument();
    });

    it('triggers onChange with the correct tab id when clicked', () => {
      const handleChange = vi.fn();
      render(<BottomNav active="home" onChange={handleChange} />);
      
      const navigateTab = screen.getByText('Navigate');
      fireEvent.click(navigateTab.closest('button')!);
      expect(handleChange).toHaveBeenCalledWith('navigate');
    });

    it('sets active class and aria-current on the active tab', () => {
      render(<BottomNav active="translate" onChange={vi.fn()} />);
      const activeTab = screen.getByLabelText('Open conversation translator');
      expect(activeTab).toHaveClass('active');
      expect(activeTab).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('AppHeader', () => {
    it('renders logo when showBack is false', () => {
      render(<AppHeader theme="dark" onToggleTheme={vi.fn()} showBack={false} />);
      expect(screen.getByText('Kick')).toBeInTheDocument();
      expect(screen.getByText('Mate')).toBeInTheDocument();
    });

    it('renders back button and custom title when showBack is true', () => {
      render(
        <AppHeader
          theme="dark"
          onToggleTheme={vi.fn()}
          showBack={true}
          title="Emergency Help"
          onBack={vi.fn()}
        />
      );
      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      expect(screen.getByText('Emergency Help')).toBeInTheDocument();
    });

    it('triggers theme toggle callback when clicked', () => {
      const handleToggle = vi.fn();
      render(<AppHeader theme="dark" onToggleTheme={handleToggle} showBack={false} />);
      const toggleBtn = screen.getByLabelText('Switch to light mode');
      fireEvent.click(toggleBtn);
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('SOSButton', () => {
    it('renders the floating SOS button and handles click', () => {
      const handleClick = vi.fn();
      render(<SOSButton onClick={handleClick} />);
      
      const button = screen.getByLabelText('Emergency SOS - tap for immediate help');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('🆘')).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
