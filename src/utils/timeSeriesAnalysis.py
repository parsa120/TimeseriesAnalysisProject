# Time Series Analysis Utilities

from typing import TypedDict, List
from scipy.optimize import fsolve, minimize
import numpy as np


class TimeSeriesData(TypedDict):
    values: List[float]
    labels: List[str]


class AutocorrelationResult(TypedDict):
    lag: int
    value: float


class AnalysisResults(TypedDict):
    autocorrelations: List[AutocorrelationResult]
    trendCoefficient: float
    hasTrend: bool


def mean(values: List[float]) -> float:
    """Calculate mean of an array"""
    return sum(values) / len(values) if len(values) > 0 else 0


def calculate_autocorrelation(data: List[float], lag: int) -> float:
    """Calculate autocorrelation for a given lag"""
    n = len(data)
    if lag >= n:
        return 0

    data_mean = mean(data)

    numerator = sum((data[i] - data_mean) *
                    (data[i + lag] - data_mean) for i in range(n - lag))
    denominator = sum((data[i] - data_mean) ** 2 for i in range(n))

    return numerator / denominator if denominator != 0 else 0


def calculate_trend_coefficient(data: List[float]) -> float:
    """Calculate trend coefficient (â) using linear regression"""
    n = len(data)
    indices = list(range(1, n + 1))

    mean_x = mean(indices)
    mean_y = mean(data)

    numerator = sum((indices[i] - mean_x) * (data[i] - mean_y)
                    for i in range(n))
    denominator = sum((indices[i] - mean_x) ** 2 for i in range(n))

    return numerator / denominator if denominator != 0 else 0


def analyze_time_series(data: List[float]) -> AnalysisResults:
    """Perform full time series analysis"""
    # Calculate autocorrelations for lags 1-5
    autocorrelations = [
        {"lag": i + 1, "value": calculate_autocorrelation(data, i + 1)}
        for i in range(10)
    ]

    # Calculate trend coefficient
    trend_coefficient = calculate_trend_coefficient(data)

    # Determine if there's a significant trend (threshold: abs(â) > 0.1)
    has_trend = abs(trend_coefficient) > 0.1

    return {
        "autocorrelations": autocorrelations,
        "trendCoefficient": trend_coefficient,
        "hasTrend": has_trend,
    }


def parse_csv(content: str) -> TimeSeriesData:
    """Parse CSV data"""
    lines = content.strip().split('\n')
    values: List[float] = []
    labels: List[str] = []

    # Skip header if it exists
    start_index = 1 if lines and not _is_numeric(lines[0].split(',')[0]) else 0

    for i in range(start_index, len(lines)):
        parts = lines[i].split(',')
        if len(parts) >= 2:
            labels.append(parts[0].strip())
            try:
                values.append(float(parts[1].strip()))
            except ValueError:
                continue
        elif len(parts) == 1:
            labels.append(str(i))
            try:
                values.append(float(parts[0].strip()))
            except ValueError:
                continue

    return {"values": values, "labels": labels}


def _is_numeric(s: str) -> bool:
    """Check if a string is numeric"""
    try:
        float(s.strip())
        return True
    except ValueError:
        return False


def calculate_difference(data: List[float]) -> List[float]:
    """Calculate first difference: Y_t = X_t - X_(t-1)"""
    if len(data) < 2:
        return []

    return [data[i] - data[i - 1] for i in range(1, len(data))]


def generate_ma1(n_samples: int, phi_1: float, variance: float) -> List[float]:
    """
    Generate MA(1) time series: X_t = phi_1 * Eps_(t-1) + Eps_t
    where Eps ~ N(0, variance)

    Args:
        n_samples: Number of samples to generate
        phi_1: MA(1) coefficient
        variance: Variance of the normal distribution

    Returns:
        List of generated MA(1) values
    """
    import random
    import math

    # Generate white noise samples: Eps ~ N(0, variance)
    std_dev = math.sqrt(variance)
    epsilon = [random.gauss(0, std_dev) for _ in range(n_samples + 1)]

    # Generate MA(1) process: X_t = phi_1 * Eps_(t-1) + Eps_t
    ma1_series = []
    for t in range(1, n_samples + 1):
        x_t = phi_1 * epsilon[t - 1] + epsilon[t]
        ma1_series.append(x_t)

    return ma1_series


def estimate_ma_mme(values: List[float], order: int) -> dict:
    """
    Estimates MA(q) parameters for order q using Method of Moments.
    """

    if order < 1:
        return {"error": "Order must be at least 1"}

    # Calculate sample autocorrelations
    r_sample = [calculate_autocorrelation(values, k) for k in range(1, order + 1)]

    # Define the system of equations
    def equations(params):
        phis = [1.0] + list(params)

        # Common denom: 1 + sum of phi_i^2 for i=0 to q
        denom = sum(p ** 2 for p in phis)

        residuals = []
        # Calculate theoretical rho for each lag
        for k in range(1, order + 1):
            # Numerator for lag k: sum(phi_i * phi_{i+k})
            numerator = 0.0
            for j in range(order - k + 1):
                numerator += phis[j] * phis[j + k]
            rho_theoretical = numerator / denom

            residuals.append(rho_theoretical - r_sample[k - 1])

        return residuals

    # Solve numerically with initial guess of 0.1 for all phis
    initial_guess = [0.1] * order
    phi_solution = fsolve(equations, initial_guess)

    result = {}
    for i in range(order):
        result[f"phi{i + 1}"] = round(float(phi_solution[i]), 5)

    return result


def estimate_ma_mse(values: List[float], order: int) -> dict:
    """
    Estimates MA(q) parameters by minimizing Mean Squared Error (SSE).
    Assumption: Mean is zero.
    Model: X_t = e_t + phi_1*e_{t-1} + ... + phi_q*e_{t-q}
    """

    if order < 1:
        return {"error": "Order must be at least 1"}

    series = np.array(values, dtype=float)
    n = len(series)

    # Initial guess for phis
    initial_guess = [0.1] * order

    def css_objective_zero_mean(phis):
        errors = np.zeros(n)
        sse = 0.0

        for t in range(n):
            # Calculate MA part: sum(phi_j * e_{t-(j+1)})
            ma_part = 0.0
            for j in range(order):
                lag_index = t - (j + 1)
                if lag_index >= 0:
                    ma_part += phis[j] * errors[lag_index]

            # e_t = X_t - MA_part
            errors[t] = series[t] - ma_part
            sse += errors[t] ** 2

        return sse

    # Phis roughly in (-1, 1)
    bounds = [(-0.99999, 0.99999)] * order
    result = minimize(
        css_objective_zero_mean,
        initial_guess,
        bounds=bounds
    )

    # Format results
    optimized_phis = result.x
    output = {}
    for i, val in enumerate(optimized_phis):
        output[f"phi{i + 1}"] = round(float(val), 5)
    output["mse_value"] = round(float(result.fun / n), 5)

    return output

def estimate_ar_mme(values: List[float], order: int) -> dict:
    """
    Estimates AR(p) parameters using Method of Moments Estimation (Yule-Walker).
    AR(p) model: X_t = phi_1*X_{t-1} + ... + phi_p*X_{t-p} + e_t
    
    Yule-Walker equations: R * phi = r
    where R[i,j] = rho(|i-j|), r[i] = rho(i+1)
    """
    if order < 1:
        return {"error": "Order must be at least 1"}
    
    # Calculate sample autocorrelations for lags 0 to order
    rho = [calculate_autocorrelation(values, k) for k in range(order + 1)]
    
    # Build Yule-Walker matrix R (autocorrelation matrix)
    # R[i,j] = rho(|i-j|)
    R = np.zeros((order, order))
    for i in range(order):
        for j in range(order):
            lag = abs(i - j)
            R[i, j] = rho[lag]
    
    # Build right-hand side vector r
    # r[i] = rho(i+1)
    r = np.array([rho[k + 1] for k in range(order)])
    
    try:
        # Solve Yule-Walker equations: R * phi = r
        phi_solution = np.linalg.solve(R, r)
        
        result = {}
        for i in range(order):
            result[f"phi{i + 1}"] = round(float(phi_solution[i]), 5)
        
        # Calculate MSE (variance of residuals)
        # Var(e_t) = Var(X_t) * (1 - sum(phi_k * rho_k))
        variance_x = rho[0]  # rho(0) is the variance
        mse = variance_x * (1 - sum(phi_solution[i] * rho[i + 1] for i in range(order)))
        result["mse"] = round(float(max(mse, 0)), 5)
        
        return result
    except np.linalg.LinAlgError:
        return {"error": "Unable to solve Yule-Walker equations"}


def estimate_ar_mse(values: List[float], order: int) -> dict:
    """
    Estimates AR(p) parameters by minimizing Mean Squared Error.
    Uses Conditional Sum of Squares (CSS) estimation.
    """
    if order < 1:
        return {"error": "Order must be at least 1"}
    
    series = np.array(values, dtype=float)
    n = len(series)
    
    # Initial guess using Yule-Walker
    initial_yw = estimate_ar_mme(values, order)
    if "error" in initial_yw:
        initial_guess = [0.1] * order
    else:
        initial_guess = [initial_yw[f"phi{i + 1}"] for i in range(order)]
    
    def css_objective(phis):
        """Calculate conditional sum of squares"""
        sse = 0.0
        
        for t in range(order, n):
            # Calculate predicted value: sum(phi_j * X_{t-j})
            predicted = 0.0
            for j in range(order):
                predicted += phis[j] * series[t - (j + 1)]
            
            # Residual
            residual = series[t] - predicted
            sse += residual ** 2
        
        return sse
    
    # Bounds: AR coefficients typically in (-1, 1)
    bounds = [(-0.99999, 0.99999)] * order
    result = minimize(css_objective, initial_guess, bounds=bounds)
    
    # Format results
    optimized_phis = result.x
    output = {}
    for i, val in enumerate(optimized_phis):
        output[f"phi{i + 1}"] = round(float(val), 5)
    
    # Calculate MSE
    mse_value = result.fun / (n - order)
    output["mse"] = round(float(mse_value), 5)
    
    return output
