import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ARRandomGenerationPage from './ARRandomGenerationPage';
import * as arDataGenerator from '../utils/arDataGenerator';

// Mock useOutletContext and useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({ isDarkMode: false }),
    useNavigate: () => vi.fn(),
  };
});

// Mock the generateARData function
vi.mock('../utils/arDataGenerator', () => ({
  generateARData: vi.fn(),
}));

// Mock TimeSeriesChart component
vi.mock('../components/TimeSeriesChart', () => ({
  default: ({ data }: any) => (
    <div data-testid="time-series-chart">
      Chart with {data?.values?.length || 0} values
    </div>
  ),
}));

// Mock ARParameterEstimationControls component
vi.mock('../components/ARParameterEstimationControls', () => ({
  default: ({ onEstimate, isEstimating }: any) => (
    <div data-testid="ar-estimation-controls">
      <button onClick={() => onEstimate(1)} disabled={isEstimating}>
        تخمین پارامترهای AR
      </button>
    </div>
  ),
}));

// Mock ARParametersDisplay component
vi.mock('../components/ARParametersDisplay', () => ({
  default: ({ parameters }: any) => (
    <div data-testid="ar-parameters-display">
      Parameters: {JSON.stringify(parameters)}
    </div>
  ),
}));

describe('ARRandomGenerationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (arDataGenerator.generateARData as any).mockReturnValue(
      Array.from({ length: 100 }, () => Math.random())
    );
  });

  describe('Input Fields', () => {
    it('should render the page', () => {
      render(<ARRandomGenerationPage />);
      expect(screen.getByText(/تولید داده AR/)).toBeInTheDocument();
    });

    it('should have generate button', () => {
      render(<ARRandomGenerationPage />);
      expect(screen.getByRole('button', { name: /تولید داده/ })).toBeInTheDocument();
    });
  });

  describe('Generate Button', () => {
    it('should display generate button', () => {
      render(<ARRandomGenerationPage />);
      expect(screen.getByRole('button', { name: /تولید داده/ })).toBeInTheDocument();
    });

    it('should trigger data generation', async () => {
      render(<ARRandomGenerationPage />);
      const button = screen.getByRole('button', { name: /تولید داده/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(arDataGenerator.generateARData).toHaveBeenCalled();
      });
    });

    it('should pass correct parameters', async () => {
      render(<ARRandomGenerationPage />);
      const button = screen.getByRole('button', { name: /تولید داده/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(arDataGenerator.generateARData).toHaveBeenCalledWith(
          1,
          { phi1: 0.5 },
          100
        );
      });
    });
  });

  describe('Generated Data Display', () => {
    it('should display chart after generation', async () => {
      render(<ARRandomGenerationPage />);
      const button = screen.getByRole('button', { name: /تولید داده/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('time-series-chart')).toBeInTheDocument();
      });
    });

    it('should display action buttons', async () => {
      render(<ARRandomGenerationPage />);
      const button = screen.getByRole('button', { name: /تولید داده/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /تحلیل/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /بازگشت/ })).toBeInTheDocument();
      });
    });
  });

  describe('Farsi Labels', () => {
    it('should display Farsi title', () => {
      render(<ARRandomGenerationPage />);
      expect(screen.getByText(/تولید داده AR/)).toBeInTheDocument();
    });

    it('should display Farsi button text', () => {
      render(<ARRandomGenerationPage />);
      expect(screen.getByRole('button', { name: /تولید داده/ })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle generation errors', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      (arDataGenerator.generateARData as any).mockImplementation(() => {
        throw new Error('Generation failed');
      });

      render(<ARRandomGenerationPage />);
      const button = screen.getByRole('button', { name: /تولید داده/ });
      fireEvent.click(button);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalled();
      });

      alertMock.mockRestore();
    });
  });
});
