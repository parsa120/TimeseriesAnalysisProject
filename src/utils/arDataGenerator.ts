/**
 * Generate AR(1) random time series data
 * Model: X_t = phi * X_{t-1} + epsilon_t, where epsilon ~ N(0, 1)
 */
export function generateARData(
  order: number,
  parameters: Record<string, number>,
  sampleSize: number,
  seed?: number
): number[] {
  // Use seed for reproducibility if provided
  let rng = seed ?? Math.random() * 10000;

  // Simple random number generator
  const random = () => {
    rng = (rng * 1103515245 + 12345) % 2147483648;
    return rng / 2147483648;
  };

  // Generate normal random variable using Box-Muller
  const normalRandom = () => {
    const u1 = random();
    const u2 = random();
    return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  };

  const phi = parameters.phi1 || 0;

  // Generate data with burn-in period
  const burnIn = 100;
  const data: number[] = [];

  for (let i = 0; i < sampleSize + burnIn; i++) {
    const noise = normalRandom();
    const value = i === 0 ? noise : phi * data[i - 1] + noise;
    data.push(value);
  }

  // Return data after burn-in
  return data.slice(burnIn);
}
