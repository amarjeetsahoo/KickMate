import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Stadium3DView } from '../components/layout/Stadium3DView';

// Mock the Stadium3DController to avoid JSDOM WebGL rendering errors
let shouldWebGLFail = false;

vi.mock('../services/agents/Stadium3DController', () => {
  return {
    Stadium3DController: class {
      constructor() {
        if (shouldWebGLFail) {
          throw new Error('Simulated WebGL failure');
        }
      }
      setWaypoints = vi.fn();
      drawRoute = vi.fn();
      focusOn = vi.fn();
      destroy = vi.fn();
    }
  };
});

describe('Stadium3DView WebGL Component', () => {
  const mockZones = [
    { id: 'gate-a', label: 'Gate A', type: 'gate', x: 200, y: 50, z: 0 },
    { id: 'sec-100', label: '100s', type: 'section', x: 200, y: 180, z: 0 },
    { id: 'toilet-1', label: 'Restrooms N', type: 'toilet', x: 200, y: 150, z: 0, accessible: true }
  ];

  const mockSteps = [
    { instruction: 'Enter through Gate A', landmark: 'Gate A', floor: 0 },
    { instruction: 'Proceed to Restrooms', landmark: 'Restrooms N', floor: 0 }
  ];

  beforeEach(() => {
    shouldWebGLFail = false;
    // Mock getContext to return dummy WebGL context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({});
  });

  it('renders WebGL canvas inside layout', () => {
    render(
      <Stadium3DView
        zones={mockZones as any}
        routeSteps={mockSteps}
        activeStepIndex={0}
        accessibleOnly={false}
        onFallbackTo2D={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/3D Interactive Stadium Map/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag to rotate/i)).toBeInTheDocument();
    expect(screen.getByText(/Switch to 2D/i)).toBeInTheDocument();
  });

  it('triggers fallback callback when WebGL is unsupported', () => {
    shouldWebGLFail = true;
    const handleFallback = vi.fn();

    render(
      <Stadium3DView
        zones={mockZones as any}
        routeSteps={mockSteps}
        activeStepIndex={0}
        accessibleOnly={false}
        onFallbackTo2D={handleFallback}
      />
    );

    // Should display fallback screen
    expect(screen.getByText(/3D WebGL Not Supported/i)).toBeInTheDocument();
    
    // Clicking fallback button triggers callback
    const fallbackBtn = screen.getByLabelText(/Switch to 2D Map fallback/i);
    fireEvent.click(fallbackBtn);
    expect(handleFallback).toHaveBeenCalledTimes(1);
  });

  it('renders accessibility checkpoints split-screen panel when accessibleOnly is true', () => {
    render(
      <Stadium3DView
        zones={mockZones as any}
        routeSteps={mockSteps}
        activeStepIndex={0}
        accessibleOnly={true}
        onFallbackTo2D={vi.fn()}
      />
    );

    expect(screen.getByText(/Accessible Verification Checkpoints/i)).toBeInTheDocument();
    expect(screen.getByText(/Entrance Gate Elevator Access/i)).toBeInTheDocument();
    expect(screen.getByText(/Concourse Elevator/i)).toBeInTheDocument();
  });
});
