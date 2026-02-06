# Importing required libraries
from flask import Flask, request, jsonify
import numpy as np
import statsmodels.api as sm

app = Flask(__name__)

# AR parameter estimation functions

def estimate_ar_parameters(data, order):
    model = sm.tsa.AR(data)
    fitted_model = model.fit(maxlag=order)
    return fitted_model.params.tolist()

@app.route('/api/estimate-ar-parameters', methods=['POST'])
def estimate_ar():
    json_data = request.get_json()
    data = json_data['data']
    order = json_data['order']
    params = estimate_ar_parameters(data, order)
    return jsonify({'parameters': params})

if __name__ == '__main__':
    app.run(debug=True)