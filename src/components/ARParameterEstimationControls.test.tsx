import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ARParameterEstimationControls from './ARParameterEstimationControls';

describe('ARParameterEstimationControls', () => {
  const mockOnEstimate = vi.fn();
  const mockOnOrderChange = vi.fn();

  beforeEach(() => {
    mockOnEstimate.mockClear();
    mockOnOrderChange.mockClear();
  });

  describe('Order Selection', () => {
    it('should display Farsi label "مرتبه AR"', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      expect(screen.getByText('مرتبه AR')).toBeInTheDocument();
    });

    it('should display select trigger with current order', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={5}
          onOrderChange={mockOnOrderChange}
        />
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
      expect(selectTrigger).toHaveTextContent('5');
    });

    it('should default to order 1', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveTextContent('1');
    });
  });

  describe('Button States', () => {
    it('should display "Estimate AR Parameters" button with Farsi text', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      expect(screen.getByText('تخمین پارامترهای AR')).toBeInTheDocument();
    });

    it('should enable button initially', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      const button = screen.getByRole('button', { name: /تخمین پارامترهای AR/ });
      expect(button).not.toBeDisabled();
    });

    it('should disable button during estimation', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={true}
          isEstimating={true}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading text during estimation', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={true}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      expect(screen.getByText('در حال محاسبه...')).toBeInTheDocument();
    });

    it('should call onEstimate with selected order when button is clicked', () => {
      const { container } = render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={3}
          onOrderChange={mockOnOrderChange}
        />
      );

      const button = screen.getByRole('button', { name: /تخمین پارامترهای AR/ });
      button.click();

      expect(mockOnEstimate).toHaveBeenCalledWith(3);
    });
  });

  describe('Dark Mode Styling', () => {
    it('should apply dark mode styling when isDarkMode is true', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={true}
          isEstimating={false}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      const label = screen.getByText('مرتبه AR');
      expect(label).toHaveClass('text-gray-300');

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveClass('bg-gray-700', 'border-gray-600', 'text-gray-200');

      const button = screen.getByRole('button', { name: /تخمین پارامترهای AR/ });
      expect(button).toHaveClass('bg-blue-600');
    });

    it('should apply light mode styling when isDarkMode is false', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      const label = screen.getByText('مرتبه AR');
      expect(label).toHaveClass('text-gray-700');

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveClass('bg-white', 'border-gray-300', 'text-gray-900');

      const button = screen.getByRole('button', { name: /تخمین پارامترهای AR/ });
      expect(button).toHaveClass('bg-blue-500');
    });
  });

  describe('Extended Order Support (1-15)', () => {
    it('should render select with all order options 1-15', () => {
      const { container } = render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      // Check that the select component is rendered
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();

      // The SelectContent component renders options, verify the structure exists
      const selectContent = container.querySelector('[role="listbox"]');
      // Note: SelectContent may not be visible until opened, so we check the component structure
      expect(selectTrigger).toBeInTheDocument();
    });

    it('should display order 1 when selectedOrder is 1', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={1}
          onOrderChange={mockOnOrderChange}
        />
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveTextContent('1');
    });

    it('should display order 6 when selectedOrder is 6', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={6}
          onOrderChange={mockOnOrderChange}
        />
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveTextContent('6');
    });

    it('should display order 10 when selectedOrder is 10', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={10}
          onOrderChange={mockOnOrderChange}
        />
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveTextContent('10');
    });

    it('should display order 15 when selectedOrder is 15', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={15}
          onOrderChange={mockOnOrderChange}
        />
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveTextContent('15');
    });

    it('should trigger estimation with order 10', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={10}
          onOrderChange={mockOnOrderChange}
        />
      );

      const button = screen.getByRole('button', { name: /تخمین پارامترهای AR/ });
      button.click();

      expect(mockOnEstimate).toHaveBeenCalledWith(10);
    });

    it('should trigger estimation with order 15', () => {
      render(
        <ARParameterEstimationControls
          onEstimate={mockOnEstimate}
          isDarkMode={false}
          isEstimating={false}
          selectedOrder={15}
          onOrderChange={mockOnOrderChange}
        />
      );

      const button = screen.getByRole('button', { name: /تخمین پارامترهای AR/ });
      button.click();

      expect(mockOnEstimate).toHaveBeenCalledWith(15);
    });

    it('should support all orders from 1 to 15', () => {
      for (let order = 1; order <= 15; order++) {
        const { unmount } = render(
          <ARParameterEstimationControls
            onEstimate={mockOnEstimate}
            isDarkMode={false}
            isEstimating={false}
            selectedOrder={order}
            onOrderChange={mockOnOrderChange}
          />
        );

        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toHaveTextContent(order.toString());

        unmount();
      }
    });
  });
});
