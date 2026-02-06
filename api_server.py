"""
Flask API server for time series analysis
"""
from flask_cors import CORS
from flask import Flask, request, jsonify
import sys
from pathlib import Path

# Add src/utils directory to path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir / 'src' / 'utils'))


app = Flask(__name__)
CORS(app)  # Enable CORS for React app

from timeSeriesAnalysis import (
    analyze_time_series,
    parse_csv,
    calculate_difference,
    generate_ma1,
    TimeSeriesData,
    AnalysisResults,
    estimate_ma_mme,
    estimate_ma_mse,
    estimate_ar_mme,  # ADD THIS
    estimate_ar_mse   # ADD THIS
)
from AI_engine import get_ai_feedback



@app.route('/api/parse-csv', methods=['POST'])
def parse_csv_endpoint():
    """Parse CSV content"""
    try:
        data = request.get_json()
        content = data.get('content', '')

        if not content:
            return jsonify({'error': 'No content provided'}), 400

        result = parse_csv(content)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_endpoint():
    """Analyze time series data"""
    try:
        data = request.get_json()
        values = data.get('values', [])

        if not values:
            return jsonify({'error': 'No values provided'}), 400

        result = analyze_time_series(values)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai-feedback', methods=['POST'])
def ai_feedback_endpoint():
    """Get AI feedback for analysis results"""
    try:
        data = request.get_json()
        autocorrelations = data.get('autocorrelations', [])
        trend_coefficient = data.get('trendCoefficient', 0)

        if not autocorrelations:
            return jsonify({'error': 'No autocorrelations provided'}), 400

        feedback = get_ai_feedback(autocorrelations, trend_coefficient)
        return jsonify({'feedback': feedback})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/difference', methods=['POST'])
def difference_endpoint():
    """Calculate difference and analyze the differenced data"""
    try:
        data = request.get_json()
        values = data.get('values', [])
        labels = data.get('labels', [])

        if not values:
            return jsonify({'error': 'No values provided'}), 400

        # Calculate difference
        differenced_values = calculate_difference(values)

        # Adjust labels (remove first label since we lose one data point)
        differenced_labels = labels[1:] if len(labels) > 1 else [str(
            i) for i in range(1, len(differenced_values) + 1)]

        # Analyze the differenced data
        analysis_results = analyze_time_series(differenced_values)

        return jsonify({
            'data': {
                'values': differenced_values,
                'labels': differenced_labels
            },
            'analysis': analysis_results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-ma', methods=['POST'])
def generate_ma_endpoint():
    """Generate MA(1) time series"""
    try:
        data = request.get_json()
        n_samples = data.get('nSamples', 100)
        phi_1 = data.get('phi1', 0.5)
        variance = data.get('variance', 1.0)

        if n_samples <= 0:
            return jsonify({'error': 'Number of samples must be positive'}), 400

        # Generate MA(1) series
        ma1_values = generate_ma1(n_samples, phi_1, variance)

        # Create labels
        labels = [str(i + 1) for i in range(len(ma1_values))]

        return jsonify({
            'values': ma1_values,
            'labels': labels
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/estimate-ma-parameters', methods=['POST'])
def estimate_ma_parameters_endpoint():
    """Estimate MA parameters"""
    try:
        data = request.get_json()
        values = data.get('values', [])
        max_order = data.get('order', 3)

        if not values:
            return jsonify({
                'error': 'No values provided'
            }), 400

        if not isinstance(max_order, int) or max_order < 1:
            return jsonify({
                'error': 'Order must be a positive integer'
            }), 400

        mme_results = {
            f'ma{k}': estimate_ma_mme(values, order=k) for k in range(1, max_order + 1)
        }
        mse_results = {
            f'ma{k}': estimate_ma_mse(values, order=k) for k in range(1, max_order + 1)
        }

        return jsonify({
            'mme': mme_results,
            'mse': mse_results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/estimate-ar-parameters', methods=['POST'])
def estimate_ar_parameters_endpoint():
    """Estimate AR parameters using MME and MSE methods"""
    try:
        data = request.get_json()
        values = data.get('values', [])
        max_order = data.get('order', 3)

        if not values:
            return jsonify({'error': 'No values provided'}), 400

        if not isinstance(max_order, int) or max_order < 1:
            return jsonify({'error': 'Order must be a positive integer'}), 400

        mme_results = {
            f'ar{k}': estimate_ar_mme(values, order=k) for k in range(1, max_order + 1)
        }
        mse_results = {
            f'ar{k}': estimate_ar_mse(values, order=k) for k in range(1, max_order + 1)
        }

        return jsonify({
            'mme': mme_results,
            'mse': mse_results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
