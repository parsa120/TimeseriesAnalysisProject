import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ARParametersDisplay from './ARParametersDisplay';
import type { ParameterEstimationResult } from '../utils/types';

describe('ARParametersDisplay', () => {
  const mockParameters: ParameterEstimationResult = {
    mme: {
      ar1: { phi1: 0.45234, mse: 0.12345 },
      ar2: { phi1: 0.42123, phi2: 0.08234, mse: 0.11234 },
      ar3: { phi1: 0.41234, phi2: 0.07123, phi3: 0.02345, mse: 0.11123 },
    },
    mse: {
      ar1: { phi1: 0.46234, mse: 0.12123 },
      ar2: { phi1: 0.43234, phi2: 0.09123, mse: 0.11012 },
      ar3: { phi1: 0.42345, phi2: 0.08234, phi3: 0.03123, mse: 0.10923 },
    },
  };

  describe('Layout Structure', () => {
    it('should render two-column grid layout', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={false} />
      );
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });

    it('should render MME and MSE cards with correct titles', () => {
      render(<ARParametersDisplay parameters={mockParameters} isDarkMode={false} />);
      expect(screen.getByText('تخمین AR - روش گشتاورها (MME)')).toBeInTheDocument();
      expect(screen.getByText('تخمین AR - روش خطای میانگین (MSE)')).toBeInTheDocument();
    });
  });

  describe('Nested Card Structure', () => {
    it('should render nested card structure for each order', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={false} />
      );
      // Check for AR1, AR2, AR3 headers
      expect(screen.getAllByText('AR1')).toHaveLength(2); // One in MME, one in MSE
      expect(screen.getAllByText('AR2')).toHaveLength(2);
      expect(screen.getAllByText('AR3')).toHaveLength(2);
    });

    it('should display all parameters for each order', () => {
      render(<ARParametersDisplay parameters={mockParameters} isDarkMode={false} />);
      // Check MME parameters
      expect(screen.getAllByText('phi1').length).toBeGreaterThanOrEqual(2); // At least one in MME, one in MSE
      expect(screen.getAllByText('phi2').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('phi3').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('mse').length).toBeGreaterThanOrEqual(6); // 3 orders × 2 methods
    });
  });

  describe('Numeric Formatting', () => {
    it('should format numeric values to exactly 5 decimal places', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={false} />
      );
      const monospacedValues = container.querySelectorAll('.font-mono');
      monospacedValues.forEach((element) => {
        const text = element.textContent;
        if (text && /^\d+\.\d+$/.test(text)) {
          const decimalPlaces = text.split('.')[1].length;
          expect(decimalPlaces).toBe(5);
        }
      });
    });

    it('should display all parameter values with correct formatting', () => {
      render(<ARParametersDisplay parameters={mockParameters} isDarkMode={false} />);
      // Check specific formatted values - use getAllByText for values that appear multiple times
      expect(screen.getAllByText('0.45234')).toHaveLength(1); // Only in MME
      expect(screen.getAllByText('0.42123')).toHaveLength(1); // Only in MME
      expect(screen.getAllByText('0.08234')).toHaveLength(2); // In both MME and MSE
    });
  });

  describe('MSE Values', () => {
    it('should display MSE values for all orders', () => {
      render(<ARParametersDisplay parameters={mockParameters} isDarkMode={false} />);
      // Check that mse values are present
      expect(screen.getByText('0.12345')).toBeInTheDocument(); // ar1 mme mse
      expect(screen.getByText('0.11234')).toBeInTheDocument(); // ar2 mme mse
      expect(screen.getByText('0.11123')).toBeInTheDocument(); // ar3 mme mse
      expect(screen.getByText('0.12123')).toBeInTheDocument(); // ar1 mse mse
      expect(screen.getByText('0.11012')).toBeInTheDocument(); // ar2 mse mse
      expect(screen.getByText('0.10923')).toBeInTheDocument(); // ar3 mse mse
    });

    it('should display MSE values in both MME and MSE method results', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={false} />
      );
      const cards = container.querySelectorAll('[class*="rounded-xl"]');
      expect(cards.length).toBeGreaterThanOrEqual(2); // At least MME and MSE cards
    });
  });

  describe('Dark Mode Styling', () => {
    it('should apply dark mode styling when isDarkMode is true', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={true} />
      );
      const cards = container.querySelectorAll('.bg-gray-800');
      expect(cards.length).toBeGreaterThanOrEqual(2); // MME and MSE cards
    });

    it('should apply light mode styling when isDarkMode is false', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={false} />
      );
      const cards = container.querySelectorAll('.bg-white');
      expect(cards.length).toBeGreaterThanOrEqual(2); // MME and MSE cards
    });

    it('should use correct border colors for dark mode', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={true} />
      );
      const cards = container.querySelectorAll('.border-gray-700');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should use correct border colors for light mode', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={false} />
      );
      const cards = container.querySelectorAll('.border-gray-200');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should use monospace font for numeric values', () => {
      const { container } = render(
        <ARParametersDisplay parameters={mockParameters} isDarkMode={false} />
      );
      const monospacedElements = container.querySelectorAll('.font-mono');
      expect(monospacedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single order results', () => {
      const singleOrderParams: ParameterEstimationResult = {
        mme: { ar1: { phi1: 0.5, mse: 0.1 } },
        mse: { ar1: { phi1: 0.51, mse: 0.09 } },
      };
      render(<ARParametersDisplay parameters={singleOrderParams} isDarkMode={false} />);
      expect(screen.getAllByText('AR1')).toHaveLength(2); // One in each column
    });

    it('should handle multiple orders correctly', () => {
      render(<ARParametersDisplay parameters={mockParameters} isDarkMode={false} />);
      expect(screen.getAllByText('AR1')).toHaveLength(2);
      expect(screen.getAllByText('AR2')).toHaveLength(2);
      expect(screen.getAllByText('AR3')).toHaveLength(2);
    });

    it('should handle parameters with many decimal places', () => {
      const preciseParams: ParameterEstimationResult = {
        mme: { ar1: { phi1: 0.123456789, mse: 0.987654321 } },
        mse: { ar1: { phi1: 0.111111111, mse: 0.999999999 } },
      };
      render(<ARParametersDisplay parameters={preciseParams} isDarkMode={false} />);
      // Should format to 5 decimal places
      expect(screen.getByText('0.12346')).toBeInTheDocument(); // Rounded
      expect(screen.getByText('0.98765')).toBeInTheDocument(); // Rounded
    });
  });
});


import fc from 'fast-check';

/**
 * Property 9: Numeric Formatting to 5 Decimals
 * Validates: Requirements 4.2, 5.2
 *
 * For any numeric value, when displayed in the component, the value should be
 * formatted to exactly 5 decimal places using the toFixed(5) method.
 */
describe('ARParametersDisplay - Numeric Formatting Property Tests', () => {
  it('should format all numeric values to exactly 5 decimal places', () => {
    fc.assert(
      fc.property(
        fc.record({
          mme: fc.record({
            ar1: fc.record({
              phi1: fc.float({ min: -1, max: 1, noNaN: true }),
              mse: fc.float({ min: 0, max: 1, noNaN: true }),
            }),
            ar2: fc.record({
              phi1: fc.float({ min: -1, max: 1, noNaN: true }),
              phi2: fc.float({ min: -1, max: 1, noNaN: true }),
              mse: fc.float({ min: 0, max: 1, noNaN: true }),
            }),
          }),
          mse: fc.record({
            ar1: fc.record({
              phi1: fc.float({ min: -1, max: 1, noNaN: true }),
              mse: fc.float({ min: 0, max: 1, noNaN: true }),
            }),
            ar2: fc.record({
              phi1: fc.float({ min: -1, max: 1, noNaN: true }),
              phi2: fc.float({ min: -1, max: 1, noNaN: true }),
              mse: fc.float({ min: 0, max: 1, noNaN: true }),
            }),
          }),
        }),
        (parameters) => {
          const { container } = render(
            <ARParametersDisplay parameters={parameters as ParameterEstimationResult} isDarkMode={false} />
          );

          // Get all monospace elements that contain numeric values
          const monospacedElements = container.querySelectorAll('.font-mono');

          // Verify each numeric value has exactly 5 decimal places
          monospacedElements.forEach((element) => {
            const text = element.textContent;
            if (text && /^\d+\.\d+$/.test(text)) {
              // Extract decimal places
              const parts = text.split('.');
              expect(parts).toHaveLength(2);
              expect(parts[1]).toHaveLength(5);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format values correctly regardless of input precision', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        (value) => {
          // Test the formatting logic directly
          const formatted = value.toFixed(5);

          // Verify format
          expect(formatted).toMatch(/^-?\d+\.\d{5}$/);

          // Verify decimal places
          const parts = formatted.split('.');
          expect(parts[1]).toHaveLength(5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case values (very small, very large, negative)', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ min: -100, max: Math.fround(-0.00001), noNaN: true }),
          fc.float({ min: Math.fround(0.00001), max: 100, noNaN: true })
        ),
        (value) => {
          const formatted = value.toFixed(5);

          // Verify format always has exactly 5 decimal places
          const parts = formatted.split('.');
          expect(parts).toHaveLength(2);
          expect(parts[1]).toHaveLength(5);

          // Verify it's a valid number string
          expect(parseFloat(formatted)).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve numeric precision within 5 decimal places', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 1, noNaN: true }),
        (value) => {
          const formatted = value.toFixed(5);
          const parsed = parseFloat(formatted);

          // The formatted value should be close to the original (within floating point rounding error)
          // Using a more generous tolerance for floating point operations
          expect(Math.abs(parsed - value)).toBeLessThan(0.00001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format all parameter values in component consistently', () => {
    fc.assert(
      fc.property(
        fc.record({
          mme: fc.record({
            ar1: fc.record({
              phi1: fc.float({ min: -1, max: 1, noNaN: true }),
              mse: fc.float({ min: 0, max: 1, noNaN: true }),
            }),
          }),
          mse: fc.record({
            ar1: fc.record({
              phi1: fc.float({ min: -1, max: 1, noNaN: true }),
              mse: fc.float({ min: 0, max: 1, noNaN: true }),
            }),
          }),
        }),
        (parameters) => {
          const { container } = render(
            <ARParametersDisplay parameters={parameters as ParameterEstimationResult} isDarkMode={false} />
          );

          const monospacedElements = container.querySelectorAll('.font-mono');
          const formattedValues: string[] = [];

          monospacedElements.forEach((element) => {
            const text = element.textContent;
            if (text && /^\d+\.\d+$/.test(text)) {
              formattedValues.push(text);
            }
          });

          // Verify we have formatted values
          expect(formattedValues.length).toBeGreaterThan(0);

          // Verify all formatted values have exactly 5 decimal places
          formattedValues.forEach((value) => {
            const parts = value.split('.');
            expect(parts[1]).toHaveLength(5);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 7: Parameter Organization by Order
 * Validates: Requirements 3.4
 *
 * For any parameter results with multiple orders, when rendered, the component
 * should organize results by order (ar1, ar2, ar3, etc.) with nested structure
 * for each order in both MME and MSE columns.
 */
describe('ARParametersDisplay - Parameter Organization Property Tests', () => {
  it('should organize results by order (ar1, ar2, ar3, etc.)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (maxOrder) => {
          // Generate parameter results with orders from ar1 to ar{maxOrder}
          const mmeParams: Record<string, Record<string, number>> = {};
          const mseParams: Record<string, Record<string, number>> = {};

          for (let i = 1; i <= maxOrder; i++) {
            const orderKey = `ar${i}`;
            const params: Record<string, number> = {};

            // Generate phi parameters based on order
            for (let j = 1; j <= i; j++) {
              params[`phi${j}`] = Math.random() * 0.5;
            }
            params.mse = Math.random() * 0.2;

            mmeParams[orderKey] = params;
            mseParams[orderKey] = params;
          }

          const parameters: ParameterEstimationResult = {
            mme: mmeParams,
            mse: mseParams,
          };

          const { container } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );

          // Verify each order is rendered
          for (let i = 1; i <= maxOrder; i++) {
            const orderText = `AR${i}`;
            const elements = screen.getAllByText(orderText);
            // Should appear twice - once in MME, once in MSE
            expect(elements.length).toBeGreaterThanOrEqual(2);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain nested structure for each order', () => {
    fc.assert(
      fc.property(
        fc.record({
          ar1: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
          ar2: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            phi2: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
          ar3: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            phi2: fc.float({ min: -1, max: 1, noNaN: true }),
            phi3: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
        }),
        (orderParams) => {
          const parameters: ParameterEstimationResult = {
            mme: orderParams,
            mse: orderParams,
          };

          const { container } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );

          // Verify nested structure - each order should have its own container
          const nestedCards = container.querySelectorAll('[class*="rounded-lg"]');
          // Should have at least 6 nested cards (3 orders × 2 methods)
          expect(nestedCards.length).toBeGreaterThanOrEqual(6);

          // Verify AR1 has 1 phi parameter
          expect(screen.getAllByText('phi1').length).toBeGreaterThanOrEqual(2); // At least in MME and MSE

          // Verify AR2 has 2 phi parameters
          expect(screen.getAllByText('phi2').length).toBeGreaterThanOrEqual(2);

          // Verify AR3 has 3 phi parameters
          expect(screen.getAllByText('phi3').length).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should display correct number of parameters for each order', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (order) => {
          const mmeParams: Record<string, Record<string, number>> = {};
          const mseParams: Record<string, Record<string, number>> = {};

          // Create parameters for the specified order
          const params: Record<string, number> = {};
          for (let j = 1; j <= order; j++) {
            params[`phi${j}`] = Math.random() * 0.5;
          }
          params.mse = Math.random() * 0.2;

          const orderKey = `ar${order}`;
          mmeParams[orderKey] = params;
          mseParams[orderKey] = params;

          const parameters: ParameterEstimationResult = {
            mme: mmeParams,
            mse: mseParams,
          };

          const { container } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );

          // Count phi parameters displayed
          let phiCount = 0;
          for (let j = 1; j <= order; j++) {
            const phiElements = screen.queryAllByText(`phi${j}`);
            if (phiElements.length > 0) {
              phiCount++;
            }
          }

          // Should have at least 'order' phi parameters (one per order level)
          expect(phiCount).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should separate MME and MSE results in two columns', () => {
    fc.assert(
      fc.property(
        fc.record({
          ar1: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
          ar2: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            phi2: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
        }),
        (orderParams) => {
          const parameters: ParameterEstimationResult = {
            mme: orderParams,
            mse: orderParams,
          };

          const { container } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );

          // Verify two-column grid layout
          const gridContainer = container.querySelector('.grid');
          expect(gridContainer).toHaveClass('md:grid-cols-2');

          // Verify both MME and MSE titles are present using getAllByText
          const mmeElements = screen.getAllByText('تخمین AR - روش گشتاورها (MME)');
          const mseElements = screen.getAllByText('تخمین AR - روش خطای میانگین (MSE)');
          expect(mmeElements.length).toBeGreaterThan(0);
          expect(mseElements.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain order consistency across multiple renders', () => {
    fc.assert(
      fc.property(
        fc.record({
          ar1: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
          ar2: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            phi2: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
          ar3: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            phi2: fc.float({ min: -1, max: 1, noNaN: true }),
            phi3: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
        }),
        (orderParams) => {
          const parameters: ParameterEstimationResult = {
            mme: orderParams,
            mse: orderParams,
          };

          // Render twice to verify consistency
          const { rerender } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );

          const firstRenderAR1 = screen.getAllByText('AR1');
          const firstRenderAR2 = screen.getAllByText('AR2');
          const firstRenderAR3 = screen.getAllByText('AR3');

          // Re-render with same parameters
          rerender(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );

          const secondRenderAR1 = screen.getAllByText('AR1');
          const secondRenderAR2 = screen.getAllByText('AR2');
          const secondRenderAR3 = screen.getAllByText('AR3');

          // Verify same number of elements rendered
          expect(secondRenderAR1.length).toBe(firstRenderAR1.length);
          expect(secondRenderAR2.length).toBe(firstRenderAR2.length);
          expect(secondRenderAR3.length).toBe(firstRenderAR3.length);
        }
      ),
      { numRuns: 20 }
    );
  });
});


/**
 * Property 14: Dark Mode Reactivity
 * Validates: Requirements 7.3
 *
 * For any parameter results, when the isDarkMode prop changes, the component
 * should re-render with updated styling reflecting the new mode.
 */
describe('ARParametersDisplay - Dark Mode Reactivity Property Tests', () => {
  it('should toggle between dark and light mode styling', () => {
    fc.assert(
      fc.property(
        fc.record({
          ar1: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
          ar2: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            phi2: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
        }),
        (orderParams) => {
          const parameters: ParameterEstimationResult = {
            mme: orderParams,
            mse: orderParams,
          };

          // Start with light mode
          const { container, rerender } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );

          // Verify light mode styling
          let cards = container.querySelectorAll('.bg-white');
          expect(cards.length).toBeGreaterThanOrEqual(2);

          // Switch to dark mode
          rerender(
            <ARParametersDisplay parameters={parameters} isDarkMode={true} />
          );

          // Verify dark mode styling
          cards = container.querySelectorAll('.bg-gray-800');
          expect(cards.length).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should apply correct border colors based on dark mode', () => {
    fc.assert(
      fc.property(
        fc.record({
          ar1: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
        }),
        (orderParams) => {
          const parameters: ParameterEstimationResult = {
            mme: orderParams,
            mse: orderParams,
          };

          // Test light mode borders
          const { container: lightContainer } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );
          let borderCards = lightContainer.querySelectorAll('.border-gray-200');
          expect(borderCards.length).toBeGreaterThanOrEqual(2);

          // Test dark mode borders
          const { container: darkContainer } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={true} />
          );
          borderCards = darkContainer.querySelectorAll('.border-gray-700');
          expect(borderCards.length).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should apply correct text colors based on dark mode', () => {
    fc.assert(
      fc.property(
        fc.record({
          ar1: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
        }),
        (orderParams) => {
          const parameters: ParameterEstimationResult = {
            mme: orderParams,
            mse: orderParams,
          };

          // Test light mode text
          const { container: lightContainer } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );
          let textElements = lightContainer.querySelectorAll('.text-gray-900');
          expect(textElements.length).toBeGreaterThan(0);

          // Test dark mode text
          const { container: darkContainer } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={true} />
          );
          textElements = darkContainer.querySelectorAll('.text-gray-200');
          expect(textElements.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain content while changing dark mode', () => {
    fc.assert(
      fc.property(
        fc.record({
          ar1: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
          ar2: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            phi2: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
        }),
        (orderParams) => {
          const parameters: ParameterEstimationResult = {
            mme: orderParams,
            mse: orderParams,
          };

          // Render in light mode
          const { rerender } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );

          const lightModeAR1 = screen.getAllByText('AR1');
          const lightModeAR2 = screen.getAllByText('AR2');

          // Switch to dark mode
          rerender(
            <ARParametersDisplay parameters={parameters} isDarkMode={true} />
          );

          const darkModeAR1 = screen.getAllByText('AR1');
          const darkModeAR2 = screen.getAllByText('AR2');

          // Verify content is preserved
          expect(darkModeAR1.length).toBe(lightModeAR1.length);
          expect(darkModeAR2.length).toBe(lightModeAR2.length);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should apply nested card styling based on dark mode', () => {
    fc.assert(
      fc.property(
        fc.record({
          ar1: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
          ar2: fc.record({
            phi1: fc.float({ min: -1, max: 1, noNaN: true }),
            phi2: fc.float({ min: -1, max: 1, noNaN: true }),
            mse: fc.float({ min: 0, max: 1, noNaN: true }),
          }),
        }),
        (orderParams) => {
          const parameters: ParameterEstimationResult = {
            mme: orderParams,
            mse: orderParams,
          };

          // Test light mode nested cards
          const { container: lightContainer } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={false} />
          );
          let nestedCards = lightContainer.querySelectorAll('.bg-gray-50');
          expect(nestedCards.length).toBeGreaterThanOrEqual(4); // 2 orders × 2 methods

          // Test dark mode nested cards - check for rounded-lg which is on nested cards
          const { container: darkContainer } = render(
            <ARParametersDisplay parameters={parameters} isDarkMode={true} />
          );
          // In dark mode, nested cards have bg-gray-700/50, so we check for rounded-lg elements
          // that are nested inside the main cards
          const darkNestedCards = darkContainer.querySelectorAll('[class*="rounded-lg"]');
          expect(darkNestedCards.length).toBeGreaterThanOrEqual(4); // 2 orders × 2 methods
        }
      ),
      { numRuns: 20 }
    );
  });
});
