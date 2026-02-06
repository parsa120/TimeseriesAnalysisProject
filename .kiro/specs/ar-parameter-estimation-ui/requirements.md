# Requirements Document: AR Parameter Estimation UI

## Introduction

This feature adds comprehensive AR (AutoRegressive) parameter estimation UI to the time series analysis application. The backend already provides AR parameter estimation through MME (Method of Moments Estimation) and MSE (Mean Squared Error) methods via the `/api/estimate-ar-parameters` endpoint. This feature creates a user interface that allows users to select AR order, trigger estimation, and view results for both methods side-by-side with appropriate Farsi labels and dark mode support.

## Glossary

- **AR_Model**: AutoRegressive model for time series forecasting
- **Order**: The number of previous values used in the AR model (1-5)
- **MME**: Method of Moments Estimation - a parameter estimation technique
- **MSE**: Mean Squared Error - an optimization-based parameter estimation technique
- **Parameter**: Estimated coefficient (phi1, phi2, etc.) in the AR model
- **TimeSeriesPage**: The main page component where analysis is performed
- **ARParametersDisplay**: Component that renders AR parameter estimation results
- **Dark_Mode**: Visual theme with dark background colors for reduced eye strain
- **Farsi_Label**: Text label in Persian/Farsi language

## Requirements

### Requirement 1: AR Order Selection Control

**User Story:** As a user, I want to select the AR order (1-5) before estimation, so that I can control the complexity of the AR model.

#### Acceptance Criteria

1. WHEN the user views the AR parameter estimation section THEN the system SHALL display a control to select AR order from 1 to 5
2. WHEN the user selects an AR order THEN the system SHALL store the selected order in component state
3. WHEN the AR order selection control is displayed THEN the system SHALL show a Farsi label "مرتبه AR" (AR Order)
4. WHEN the user has not selected an AR order THEN the system SHALL default to order 1
5. WHERE dark mode is enabled THEN the order selection control SHALL use dark mode styling with appropriate contrast

### Requirement 2: AR Parameter Estimation Trigger

**User Story:** As a user, I want to trigger AR parameter estimation with a single action, so that I can quickly analyze the time series data.

#### Acceptance Criteria

1. WHEN the user has uploaded time series data THEN the system SHALL display an "Estimate AR Parameters" button
2. WHEN the user clicks the estimation button THEN the system SHALL send a POST request to `/api/estimate-ar-parameters` with the time series values and selected order
3. WHEN the estimation is in progress THEN the system SHALL disable the button and show loading state with text "در حال محاسبه..." (Calculating...)
4. WHEN the estimation completes successfully THEN the system SHALL display the results and enable the button
5. IF an error occurs during estimation THEN the system SHALL display an error message and enable the button

### Requirement 3: AR Parameter Results Display

**User Story:** As a user, I want to view AR parameter estimation results for both MME and MSE methods, so that I can compare different estimation approaches.

#### Acceptance Criteria

1. WHEN AR parameter estimation completes THEN the system SHALL display results in a two-column layout with MME results on the left and MSE results on the right
2. WHEN displaying MME results THEN the system SHALL show a card with title "تخمین AR - روش گشتاورها (MME)" (AR Estimation - Method of Moments)
3. WHEN displaying MSE results THEN the system SHALL show a card with title "تخمین AR - روش خطای میانگین (MSE)" (AR Estimation - Mean Squared Error)
4. WHEN displaying parameter results THEN the system SHALL organize results by order (e.g., "ORDER_1", "ORDER_2") with nested parameter display
5. WHERE dark mode is enabled THEN the results cards SHALL use dark mode styling with gray-800 background and gray-700 borders

### Requirement 4: Parameter Value Display

**User Story:** As a user, I want to see estimated parameters clearly formatted, so that I can understand the AR model coefficients.

#### Acceptance Criteria

1. WHEN displaying parameter values THEN the system SHALL show each parameter (phi1, phi2, etc.) with its estimated value
2. WHEN displaying parameter values THEN the system SHALL format numeric values to 5 decimal places
3. WHEN displaying parameters THEN the system SHALL use monospace font for numeric values for clarity
4. WHEN a parameter section is displayed THEN the system SHALL use a nested card layout with order as the header
5. WHERE dark mode is enabled THEN parameter labels SHALL use gray-400 color and values SHALL use gray-200 color

### Requirement 5: MSE Value Comparison

**User Story:** As a user, I want to see MSE values for each order, so that I can compare model fit quality across different AR orders.

#### Acceptance Criteria

1. WHEN AR parameter results are displayed THEN the system SHALL include MSE values for each order in the MSE method results
2. WHEN displaying MSE values THEN the system SHALL format them to 5 decimal places
3. WHEN multiple orders are estimated THEN the system SHALL display MSE values in a way that allows easy comparison
4. WHEN MSE values are shown THEN the system SHALL label them clearly as "mse" or similar identifier

### Requirement 6: Integration with TimeSeriesPage

**User Story:** As a user, I want AR parameter estimation to be seamlessly integrated into the main analysis page, so that I can use it alongside other analysis tools.

#### Acceptance Criteria

1. WHEN the user has uploaded time series data and completed initial analysis THEN the system SHALL display AR parameter estimation controls
2. WHEN AR parameter estimation is triggered THEN the system SHALL store results in the AnalysisResults state
3. WHEN AR parameter results are available THEN the system SHALL display them using the ARParametersDisplay component
4. WHEN the user performs a new analysis THEN the system SHALL clear previous AR parameter results
5. WHEN the user differencies the data THEN the system SHALL allow AR parameter estimation on the differenced data

### Requirement 7: Dark Mode Support

**User Story:** As a user, I want the AR parameter estimation UI to respect dark mode settings, so that the interface is consistent with the rest of the application.

#### Acceptance Criteria

1. WHEN dark mode is enabled THEN the AR parameter estimation section SHALL use dark mode colors (gray-800, gray-700, gray-600)
2. WHEN dark mode is disabled THEN the AR parameter estimation section SHALL use light mode colors (white, gray-50, gray-200)
3. WHEN the user toggles dark mode THEN the AR parameter estimation UI SHALL update immediately
4. WHEN displaying text in dark mode THEN the system SHALL use appropriate contrast ratios for readability
5. WHERE buttons are displayed THEN they SHALL follow the existing dark mode button styling patterns

### Requirement 8: Farsi Language Support

**User Story:** As a user, I want all AR parameter estimation UI labels and messages to be in Farsi, so that I can use the application in my preferred language.

#### Acceptance Criteria

1. WHEN the AR parameter estimation section is displayed THEN all labels SHALL be in Farsi language
2. WHEN displaying section titles THEN the system SHALL use "تخمین پارامترهای AR" (AR Parameter Estimation)
3. WHEN displaying the order selection label THEN the system SHALL use "مرتبه AR" (AR Order)
4. WHEN displaying the estimation button THEN the system SHALL use "تخمین پارامترهای AR" (Estimate AR Parameters)
5. WHEN displaying loading state THEN the system SHALL use "در حال محاسبه..." (Calculating...)
6. WHEN displaying error messages THEN the system SHALL use Farsi error descriptions

### Requirement 9: Design Pattern Consistency

**User Story:** As a developer, I want the AR parameter estimation UI to follow existing design patterns, so that the codebase remains maintainable and consistent.

#### Acceptance Criteria

1. WHEN creating the AR parameter estimation component THEN the system SHALL follow the same Card-based layout pattern as ResultsDisplay
2. WHEN styling the component THEN the system SHALL use the same Tailwind CSS classes and dark mode patterns as existing components
3. WHEN handling state THEN the system SHALL follow the same state management patterns as TimeSeriesPage
4. WHEN making API calls THEN the system SHALL use the same fetch pattern and error handling as existing analysis endpoints
5. WHEN displaying results THEN the system SHALL use the same grid layout (grid-cols-1 md:grid-cols-2) as ResultsDisplay

### Requirement 10: Error Handling

**User Story:** As a user, I want clear error messages when AR parameter estimation fails, so that I can understand what went wrong and retry.

#### Acceptance Criteria

1. IF the API request fails THEN the system SHALL display an error message "خطا در تخمین پارامترهای AR" (Error in AR parameter estimation)
2. IF the API returns invalid data THEN the system SHALL display an error message and log the error to console
3. WHEN an error occurs THEN the system SHALL allow the user to retry the estimation
4. WHEN displaying error messages THEN the system SHALL use alert() for user notification
5. WHEN an error occurs THEN the system SHALL maintain the UI in a usable state

### Requirement 11: Extended AR Order Support

**User Story:** As a user, I want to estimate AR models with higher orders (up to 15), so that I can analyze more complex autoregressive patterns in my time series data.

#### Acceptance Criteria

1. WHEN the user views the AR order selection control THEN the system SHALL display options from 1 to 15 (previously 1-5)
2. WHEN the user selects an order between 6 and 15 THEN the system SHALL send the request to the API with the selected order
3. WHEN AR parameter results are displayed for orders 6-15 THEN the system SHALL organize and display them the same way as orders 1-5
4. WHEN displaying parameters for higher orders THEN the system SHALL show all parameters (phi1 through phi15 as applicable)
5. WHEN the user selects a higher order THEN the system SHALL maintain the same UI layout and styling

### Requirement 12: AR Parameter Estimation After Differencing

**User Story:** As a user, I want to estimate AR parameters on differenced data, so that I can analyze the autoregressive structure of stationary time series.

#### Acceptance Criteria

1. WHEN the user has differenced the time series data THEN the system SHALL keep the AR parameter estimation controls visible
2. WHEN the user clicks "Estimate AR Parameters" on differenced data THEN the system SHALL send the differenced values to the API
3. WHEN AR parameter estimation completes on differenced data THEN the system SHALL display results the same way as for original data
4. WHEN the user performs multiple differencing operations THEN the system SHALL allow AR parameter estimation on the final differenced data
5. WHEN differencing is applied THEN the AR order selection control SHALL remain available and functional

### Requirement 13: Multiple Differencing Operations

**User Story:** As a user, I want to apply differencing multiple times and still access AR parameter estimation, so that I can work with higher-order differenced data.

#### Acceptance Criteria

1. WHEN the user applies differencing to already-differenced data THEN the system SHALL keep the AR parameter estimation controls visible
2. WHEN the user applies differencing multiple times THEN the system SHALL allow AR parameter estimation after each differencing step
3. WHEN AR parameter estimation is triggered after multiple differencing operations THEN the system SHALL use the current (most recently differenced) data
4. WHEN the user performs a new differencing operation THEN the system SHALL clear previous AR parameter results
5. WHEN multiple differencing operations are applied THEN the AR order selection control SHALL remain functional with all orders available

### Requirement 14: AR(n) Random Data Generation Page

**User Story:** As a user, I want to generate random AR(n) data similar to the existing MA(1) generation page, so that I can test AR parameter estimation with known parameters.

#### Acceptance Criteria

1. WHEN the user navigates to the random data generation section THEN the system SHALL display a page for generating AR(n) random data
2. WHEN the user selects an AR order (1-5) on the generation page THEN the system SHALL display input fields for AR parameters (phi1, phi2, etc.)
3. WHEN the user enters AR parameters and clicks generate THEN the system SHALL create random AR(n) data with the specified parameters
4. WHEN AR(n) data is generated THEN the system SHALL display it in a format compatible with the main analysis page
5. WHEN the user generates AR(n) data THEN the system SHALL provide an option to use this data for analysis on the main page

### Requirement 15: Random AR(n) Data Analysis Option

**User Story:** As a user, I want to run AR parameter estimation on randomly generated AR(n) data, so that I can verify the estimation methods work correctly.

#### Acceptance Criteria

1. WHEN the user is on the main analysis page THEN the system SHALL display an option to "Run on Random AR(n) Data"
2. WHEN the user clicks this option THEN the system SHALL display a dialog or form to select AR order (1-5) for random data generation
3. WHEN the user selects an order and confirms THEN the system SHALL generate random AR(n) data with that order
4. WHEN random AR(n) data is generated THEN the system SHALL automatically populate the time series input with this data
5. WHEN random data is loaded THEN the system SHALL trigger automatic analysis and AR parameter estimation
6. WHEN AR parameter estimation completes on random data THEN the system SHALL display results for comparison with the known parameters

