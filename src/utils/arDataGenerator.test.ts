import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateARData } from './arDataGenerator';

describe('generateARData', () => {
  describe('Basic Functionality', () => {
    it('should generate data with correct length', () => {
      const order = 1;
      const parameters = { phi1: 0.5 };
      const sampleSize = 100;

      const data = generateARData(order, parameters, sampleSize);

      expect(data).toHaveLength(sampleSize);
    });

    it('should generate numeric values', () => {
      const order = 1;
      const parameters = { phi1: 0.5 };
      const sampleSize = 50;

      const data = generateARData(order, parameters, sampleSize);

      data.forEach((value) => {
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
        expect(isFinite(value)).toBe(true);
      });
    });

    it('should support order 1', () => {
      const data = generateARData(1, { phi1: 0.5 }, 100);
      expect(data).toHaveLength(100);
    });

    it('should support order 2', () => {
      const data = generateARData(2, { phi1: 0.3, phi2: 0.2 }, 100);
      expect(data).toHaveLength(100);
    });

    it('should support order 3', () => {
      const data = generateARData(3, { phi1: 0.3, phi2: 0.2, phi3: 0.1 }, 100);
      expect(data).toHaveLength(100);
    });

    it('should support order 4', () => {
      const data = generateARData(
        4,
        { phi1: 0.3, phi2: 0.2, phi3: 0.1, phi4: 0.05 },
        100
      );
      expect(data).toHaveLength(100);
    });

    it('should support order 5', () => {
      const data = generateARData(
        5,
        { phi1: 0.3, phi2: 0.2, phi3: 0.1, phi4: 0.05, phi5: 0.02 },
        100
      );
      expect(data).toHaveLength(100);
    });
  });

  describe('Reproducibility with Seed', () => {
    it('should generate same data with same seed', () => {
      const order = 1;
      const parameters = { phi1: 0.5 };
      const sampleSize = 100;
      const seed = 12345;

      const data1 = generateARData(order, parameters, sampleSize, seed);
      const data2 = generateARData(order, parameters, sampleSize, seed);

      expect(data1).toEqual(data2);
    });

    it('should generate different data with different seeds', () => {
      const order = 1;
      const parameters = { phi1: 0.5 };
      const sampleSize = 100;

      const data1 = generateARData(order, parameters, sampleSize, 12345);
      const data2 = generateARData(order, parameters, sampleSize, 54321);

      // Should not be identical (with very high probability)
      expect(data1).not.toEqual(data2);
    });

    it('should generate different data without seed', () => {
      const order = 1;
      const parameters = { phi1: 0.5 };
      const sampleSize = 100;

      const data1 = generateARData(order, parameters, sampleSize);
      const data2 = generateARData(order, parameters, sampleSize);

      // Should not be identical (with very high probability)
      expect(data1).not.toEqual(data2);
    });
  });

  describe('Parameter Handling', () => {
    it('should handle zero parameters', () => {
      const data = generateARData(1, { phi1: 0 }, 100);
      expect(data).toHaveLength(100);
      data.forEach((value) => {
        expect(isFinite(value)).toBe(true);
      });
    });

    it('should handle negative parameters', () => {
      const data = generateARData(1, { phi1: -0.5 }, 100);
      expect(data).toHaveLength(100);
      data.forEach((value) => {
        expect(isFinite(value)).toBe(true);
      });
    });

    it('should handle multiple parameters', () => {
      const parameters = {
        phi1: 0.3,
        phi2: 0.2,
        phi3: 0.1,
      };
      const data = generateARData(3, parameters, 100);
      expect(data).toHaveLength(100);
    });

    it('should ignore extra parameters', () => {
      const parameters = {
        phi1: 0.5,
        phi2: 0.3,
        phi3: 0.2,
        phi4: 0.1, // Extra parameter for order 1
      };
      const data = generateARData(1, parameters, 100);
      expect(data).toHaveLength(100);
    });

    it('should handle missing parameters', () => {
      const parameters = { phi1: 0.5 }; // Missing phi2 for order 2
      const data = generateARData(2, parameters, 100);
      expect(data).toHaveLength(100);
      data.forEach((value) => {
        expect(isFinite(value)).toBe(true);
      });
    });
  });

  describe('Property-Based Tests', () => {
    it('should always return correct length for any valid order and sample size', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 10, max: 1000 }),
          (order, sampleSize) => {
            const parameters: Record<string, number> = {};
            for (let i = 1; i <= order; i++) {
              parameters[`phi${i}`] = Math.random() * 0.5;
            }

            const data = generateARData(order, parameters, sampleSize);

            expect(data).toHaveLength(sampleSize);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate finite numeric values for any valid parameters', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 10, max: 500 }),
          (order, sampleSize) => {
            const parameters: Record<string, number> = {};
            for (let i = 1; i <= order; i++) {
              parameters[`phi${i}`] = (Math.random() - 0.5) * 0.8;
            }

            const data = generateARData(order, parameters, sampleSize);

            data.forEach((value) => {
              expect(typeof value).toBe('number');
              expect(isFinite(value)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should be reproducible with seed for any valid parameters', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 10, max: 500 }),
          fc.integer({ min: 1, max: 100000 }),
          (order, sampleSize, seed) => {
            const parameters: Record<string, number> = {};
            for (let i = 1; i <= order; i++) {
              parameters[`phi${i}`] = Math.random() * 0.5;
            }

            const data1 = generateARData(order, parameters, sampleSize, seed);
            const data2 = generateARData(order, parameters, sampleSize, seed);

            expect(data1).toEqual(data2);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate data with reasonable variance', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (order) => {
            // Generate stationary parameters: sum of |phi| < 1
            const parameters: Record<string, number> = {};
            let sumPhi = 0;
            for (let i = 1; i <= order; i++) {
              const maxPhi = (1 - sumPhi) / (order - i + 1) * 0.9;
              parameters[`phi${i}`] = Math.random() * maxPhi;
              sumPhi += Math.abs(parameters[`phi${i}`]);
            }

            const data = generateARData(order, parameters, 1000);

            // Calculate mean and variance
            const mean = data.reduce((a, b) => a + b, 0) / data.length;
            const variance =
              data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
              data.length;

            // Variance should be positive and reasonable
            expect(variance).toBeGreaterThan(0);
            expect(variance).toBeLessThan(100); // Reasonable upper bound
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum sample size', () => {
      const data = generateARData(1, { phi1: 0.5 }, 1);
      expect(data).toHaveLength(1);
      expect(isFinite(data[0])).toBe(true);
    });

    it('should handle large sample size', () => {
      const data = generateARData(1, { phi1: 0.5 }, 10000);
      expect(data).toHaveLength(10000);
    });

    it('should handle high order with small sample size', () => {
      const data = generateARData(
        5,
        { phi1: 0.2, phi2: 0.15, phi3: 0.1, phi4: 0.05, phi5: 0.02 },
        10
      );
      expect(data).toHaveLength(10);
    });

    it('should handle parameters close to stability boundary', () => {
      // AR(1) with phi close to 1 (but stable)
      const data = generateARData(1, { phi1: 0.95 }, 100);
      expect(data).toHaveLength(100);
      data.forEach((value) => {
        expect(isFinite(value)).toBe(true);
      });
    });

    it('should handle all zero parameters', () => {
      const data = generateARData(
        3,
        { phi1: 0, phi2: 0, phi3: 0 },
        100
      );
      expect(data).toHaveLength(100);
      // With all zero parameters, should be pure white noise
      data.forEach((value) => {
        expect(isFinite(value)).toBe(true);
      });
    });
  });
});


/**
 * Property: Random AR(n) Data Generation
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5
 *
 * For any valid AR order and sample size, the generated data should have
 * the correct length and be usable for analysis.
 */
describe('generateARData - Property: Random AR(n) Data Generation', () => {
  it('should generate data with correct length for any valid order and sample size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 50, max: 500 }),
        (order, sampleSize) => {
          const parameters: Record<string, number> = {};
          for (let i = 1; i <= order; i++) {
            parameters[`phi${i}`] = (Math.random() - 0.5) * 0.6;
          }

          const data = generateARData(order, parameters, sampleSize);

          // Verify generated data has correct length
          expect(data).toHaveLength(sampleSize);
          expect(data.length).toBe(sampleSize);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate valid numeric data for any AR parameters', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 50, max: 500 }),
        (order, sampleSize) => {
          const parameters: Record<string, number> = {};
          for (let i = 1; i <= order; i++) {
            parameters[`phi${i}`] = (Math.random() - 0.5) * 0.6;
          }

          const data = generateARData(order, parameters, sampleSize);

          // Verify all values are valid numbers
          data.forEach((value) => {
            expect(typeof value).toBe('number');
            expect(isNaN(value)).toBe(false);
            expect(isFinite(value)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate data suitable for time series analysis', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 100, max: 500 }),
        (order, sampleSize) => {
          // Generate stationary parameters: sum of |phi| < 1
          const parameters: Record<string, number> = {};
          let sumPhi = 0;
          for (let i = 1; i <= order; i++) {
            const maxPhi = (1 - sumPhi) / (order - i + 1) * 0.8;
            parameters[`phi${i}`] = (Math.random() - 0.5) * maxPhi;
            sumPhi += Math.abs(parameters[`phi${i}`]);
          }

          const data = generateARData(order, parameters, sampleSize);

          // Verify data has sufficient length for analysis
          expect(data.length).toBeGreaterThanOrEqual(100);

          // Verify data has reasonable statistical properties
          const mean = data.reduce((a, b) => a + b, 0) / data.length;
          const variance =
            data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            data.length;

          // Mean should be close to 0 (white noise centered at 0)
          expect(Math.abs(mean)).toBeLessThan(1);

          // Variance should be positive
          expect(variance).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain AR properties in generated data', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 200, max: 500 }),
        (order, sampleSize) => {
          const parameters: Record<string, number> = {};
          for (let i = 1; i <= order; i++) {
            parameters[`phi${i}`] = (Math.random() - 0.5) * 0.4;
          }

          const data = generateARData(order, parameters, sampleSize);

          // Verify data length
          expect(data).toHaveLength(sampleSize);

          // Verify data is suitable for AR analysis
          // Calculate autocorrelation at lag 1
          const mean = data.reduce((a, b) => a + b, 0) / data.length;
          const c0 = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
          const c1 = data.slice(0, -1).reduce((sum, val, i) => {
            return sum + (val - mean) * (data[i + 1] - mean);
          }, 0) / data.length;

          const acf1 = c1 / c0;

          // Autocorrelation should be within reasonable bounds
          expect(acf1).toBeGreaterThanOrEqual(-1);
          expect(acf1).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate reproducible data with seed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 50, max: 500 }),
        fc.integer({ min: 1, max: 100000 }),
        (order, sampleSize, seed) => {
          const parameters: Record<string, number> = {};
          for (let i = 1; i <= order; i++) {
            parameters[`phi${i}`] = (Math.random() - 0.5) * 0.6;
          }

          const data1 = generateARData(order, parameters, sampleSize, seed);
          const data2 = generateARData(order, parameters, sampleSize, seed);

          // Verify reproducibility
          expect(data1).toEqual(data2);
          expect(data1).toHaveLength(sampleSize);
          expect(data2).toHaveLength(sampleSize);
        }
      ),
      { numRuns: 100 }
    );
  });
});
