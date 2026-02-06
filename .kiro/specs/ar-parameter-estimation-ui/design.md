# Design Document: AR Parameter Estimation UI

## Overview

The AR Parameter Estimation UI feature extends the time series analysis application with a user interface for AR (AutoRegressive) parameter estimation. The backend already provides two estimation methods (MME and MSE) via the `/api/estimate-ar-parameters` endpoint. This design creates a cohesive UI that allows users to:

1. Select AR order (1-15) before estimation (extended from 1-5)
2. Trigger parameter estimation with a single button click
3. View results for both MME and MSE methods side-by-side
4. Compare estimated parameters and MSE values across orders
5. Estimate AR parameters on differenced data (multiple differencing operations supported)
6. Generate random AR(n) data for testing parameter estimation
7. Run analysis on randomly generated AR(n) data

The implementation follows existing design patterns from the MA parameter estimation UI and integrates seamlessly with the TimeSeriesPage component. AR parameter estimation controls remain visible after differencing operations, allowing users to estimate parameters on differenced data.

## Architecture

### Component Hierarchy

```
TimeSeriesPage
├── ARParameterEstimationControls (new)
│   ├── Order Selection (Select/Dropdown)
│   └── Estimate Button
└── ARParametersDisplay (existing, enhanced)
    ├── MME Results Card
    └── MSE Results Card
```

### Data Flow

```
User selects order
    ↓
User clicks "Estimate AR Parameters"
    ↓
TimeSeriesPage sends POST to /api/estimate-ar-parameters
    ↓
Backend returns {mme: {...}, mse: {...}}
    ↓
TimeSeriesPage stores in analysisResults.arParameters
    ↓
ARParametersDisplay renders results
```

### State Management

The AR parameter estimation state is managed at the TimeSeriesPage level:

- `arOrder`: number (1-5, default: 1) - Selected AR order
- `isEstimatingAR`: boolean - Loading state during estimation
- `analysisResults.arParameters`: ParameterEstimationResult - Estimation results

## Components and Interfaces

### 1. ARParameterEstimationControls Component (New)

**Purpose**: Provides UI controls for AR order selection and estimation trigger

**Props**:
```typescript
interface ARParameterEstimationControlsProps {
  onEstimate: (order: number) => void;
  isDarkMode: boolean;
  isEstimating: boolean;
  selectedOrder: number;
  onOrderChange: (order: number) => void;
}
```

**Responsibilities**:
- Display order selection dropdown (1-15, extended from 1-5)
- Display "Estimate AR Parameters" button
- Show loading state during estimation
- Handle order selection changes
- Trigger estimation callback with selected order

**Styling**:
- Uses Tailwind CSS with dark mode support
- Follows existing button and control styling patterns
- Responsive layout (flex container)
- Consistent spacing and typography

### 2. ARParametersDisplay Component (Enhanced)

**Purpose**: Displays AR parameter estimation results for both MME and MSE methods

**Props**:
```typescript
interface ARParametersDisplayProps {
  parameters: ParameterEstimationResult;
  isDarkMode: boolean;
}
```

**Data Structure**:
```typescript
interface ParameterEstimationResult {
  mme: Record<string, Record<string, number>>;
  mse: Record<string, Record<string, number>>;
}
```

Example structure:
```json
{
  "mme": {
    "ar1": {"phi1": 0.45234, "mse": 0.12345},
    "ar2": {"phi1": 0.42123, "phi2": 0.08234, "mse": 0.11234},
    "ar3": {"phi1": 0.41234, "phi2": 0.07123, "phi3": 0.02345, "mse": 0.11123}
  },
  "mse": {
    "ar1": {"phi1": 0.46234, "mse": 0.12123},
    "ar2": {"phi1": 0.43234, "phi2": 0.09123, "mse": 0.11012},
    "ar3": {"phi1": 0.42345, "phi2": 0.08234, "phi3": 0.03123, "mse": 0.10923}
  }
}
```

**Responsibilities**:
- Render two-column layout (MME and MSE)
- Display results organized by order
- Format numeric values to 5 decimal places
- Apply dark mode styling
- Use monospace font for numeric values

**Styling**:
- Two-column grid layout (grid-cols-1 md:grid-cols-2)
- Card-based design with rounded corners
- Dark mode: gray-800 background, gray-700 borders
- Light mode: white background, gray-200 borders
- Nested card layout for each order

### 3. TimeSeriesPage Integration

**Changes to TimeSeriesPage**:

1. Add state variables:
   ```typescript
   const [arOrder, setArOrder] = useState<number>(1);
   const [isEstimatingAR, setIsEstimatingAR] = useState(false);
   ```

2. Add estimation handler:
   ```typescript
   const handleEstimateAR = async (order: number) => {
     // Send POST to /api/estimate-ar-parameters
     // Store results in analysisResults.arParameters
   }
   ```

3. Render controls and results:
   ```typescript
   {analysisResults && (
     <>
       <ARParameterEstimationControls
         onEstimate={handleEstimateAR}
         isDarkMode={isDarkMode}
         isEstimating={isEstimatingAR}
         selectedOrder={arOrder}
         onOrderChange={setArOrder}
       />
       {analysisResults.arParameters && (
         <ARParametersDisplay
           parameters={analysisResults.arParameters}
           isDarkMode={isDarkMode}
         />
       )}
     </>
   )}
   ```

## Data Models

### ParameterEstimationResult

```typescript
interface ParameterEstimationResult {
  mme: Record<string, Record<string, number>>;
  mse: Record<string, Record<string, number>>;
}
```

**Structure**:
- `mme`: Object with keys like "ar1", "ar2", etc.
  - Each key maps to an object with parameter names and values
  - Includes "mse" key for model fit quality
- `mse`: Same structure as mme but with MSE-optimized parameters

**Example**:
```json
{
  "mme": {
    "ar1": {"phi1": 0.45, "mse": 0.123},
    "ar2": {"phi1": 0.42, "phi2": 0.08, "mse": 0.112}
  },
  "mse": {
    "ar1": {"phi1": 0.46, "mse": 0.121},
    "ar2": {"phi1": 0.43, "phi2": 0.09, "mse": 0.110}
  }
}
```

### API Request/Response

**Request**:
```json
{
  "values": [1.2, 1.5, 1.3, 1.8, 2.1, ...],
  "order": 3
}
```

**Response**:
```json
{
  "mme": {
    "ar1": {"phi1": 0.45, "mse": 0.123},
    "ar2": {"phi1": 0.42, "phi2": 0.08, "mse": 0.112},
    "ar3": {"phi1": 0.41, "phi2": 0.07, "phi3": 0.02, "mse": 0.111}
  },
  "mse": {
    "ar1": {"phi1": 0.46, "mse": 0.121},
    "ar2": {"phi1": 0.43, "phi2": 0.09, "mse": 0.110},
    "ar3": {"phi1": 0.42, "phi2": 0.08, "phi3": 0.03, "mse": 0.109}
  }
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.


### Property Reflection

After analyzing the acceptance criteria, I've identified the following testable properties. Several criteria focus on UI styling and appearance (dark mode colors, fonts, contrast ratios) which are not computationally verifiable and have been excluded. Code pattern consistency requirements are also excluded as they're architectural guidelines rather than functional properties.

The remaining properties focus on:
- State management and data flow
- API integration and error handling
- Component rendering and data display
- User interactions and state transitions

### Correctness Properties

Property 1: Order Selection State Management
*For any* selected AR order (1-5), when the user selects that order, the component state should be updated to reflect the selected value.
**Validates: Requirements 1.2**

Property 2: API Request Correctness
*For any* time series data and selected AR order, when the user triggers estimation, the system should send a POST request to `/api/estimate-ar-parameters` with the correct values and order parameters.
**Validates: Requirements 2.2**

Property 3: Loading State During Estimation
*For any* estimation request, while the request is in progress, the button should be disabled and loading text "در حال محاسبه..." should be displayed.
**Validates: Requirements 2.3**

Property 4: Results Display After Success
*For any* successful API response containing parameter estimation results, the system should display the results and re-enable the button.
**Validates: Requirements 2.4**

Property 5: Error Handling and Recovery
*For any* API error during estimation, the system should display an error message and enable the button to allow retry.
**Validates: Requirements 2.5, 10.3**

Property 6: Two-Column Layout Structure
*For any* parameter estimation results, the rendered output should contain a two-column grid layout with MME results in the first column and MSE results in the second column.
**Validates: Requirements 3.1**

Property 7: Parameter Organization by Order
*For any* parameter estimation results, the results should be organized by order (ar1, ar2, ar3, etc.) with nested parameter display for each order.
**Validates: Requirements 3.4**

Property 8: All Parameters Displayed
*For any* parameter estimation result for a given order, all parameters (phi1, phi2, etc.) should be rendered in the output.
**Validates: Requirements 4.1**

Property 9: Numeric Formatting to 5 Decimals
*For any* numeric parameter value in the results, the formatted output should display exactly 5 decimal places.
**Validates: Requirements 4.2, 5.2**

Property 10: MSE Values Present for All Orders
*For any* parameter estimation result, each order should include an "mse" value in both MME and MSE method results.
**Validates: Requirements 5.1**

Property 11: State Clearing on New Analysis
*For any* new analysis triggered after previous AR parameter estimation, the previous AR parameter results should be cleared from state.
**Validates: Requirements 6.4**

Property 12: Results Storage in State
*For any* successful AR parameter estimation, the results should be stored in the analysisResults.arParameters state.
**Validates: Requirements 6.2**

Property 13: Component Rendering When Results Available
*For any* state where analysisResults.arParameters is populated, the ARParametersDisplay component should be rendered.
**Validates: Requirements 6.3**

Property 14: Dark Mode Reactivity
*For any* change in isDarkMode prop, the component should re-render with updated styling reflecting the new theme.
**Validates: Requirements 7.3**

Property 15: Invalid Data Error Handling
*For any* invalid API response data, the system should display an error message and log the error to console.
**Validates: Requirements 10.2**

Property 16: UI Usability After Error
*For any* error condition, the UI controls should remain enabled and functional to allow user retry.
**Validates: Requirements 10.5**

## Error Handling

### API Error Scenarios

1. **Network Error**: Connection fails to backend
   - Display: "خطا در تخمین پارامترهای AR" (Error in AR parameter estimation)
   - Action: Enable button for retry

2. **Invalid Response**: API returns malformed data
   - Display: Error message via alert()
   - Action: Log error to console, enable button for retry

3. **Validation Error**: Invalid order or values
   - Display: Error message from API
   - Action: Enable button for retry

### Error Recovery

- Button remains enabled after error
- User can modify order and retry
- Error state is cleared on successful retry
- Console logging for debugging

## AR Parameter Estimation After Differencing

### Design Approach

The AR parameter estimation controls remain visible after differencing operations. This allows users to estimate AR parameters on differenced data without losing access to the estimation functionality.

**Key Changes**:
1. Do NOT clear AR estimation controls when differencing is applied
2. Only clear previous AR parameter results when differencing is applied
3. Allow AR parameter estimation on the current (differenced) data
4. Support multiple consecutive differencing operations

**State Management**:
- `arOrder`: Persists across differencing operations
- `analysisResults.arParameters`: Cleared when new differencing is applied
- `isEstimatingAR`: Reset to false when differencing is applied

**Data Flow**:
```
User applies differencing
    ↓
AR parameter results cleared
    ↓
AR estimation controls remain visible
    ↓
User can select order and estimate on differenced data
    ↓
Results displayed for differenced data
```

## Random AR(n) Data Generation

### New Component: ARRandomGenerationPage

**Purpose**: Generate random AR(n) data with user-specified parameters for testing

**Features**:
1. Order selection (1-5)
2. Parameter input fields (phi1, phi2, etc. based on selected order)
3. Sample size input
4. Generate button
5. Display generated data
6. Option to use generated data for analysis

**Data Structure**:
```typescript
interface ARGenerationParams {
  order: number;
  parameters: Record<string, number>; // phi1, phi2, etc.
  sampleSize: number;
  seed?: number; // Optional for reproducibility
}

interface GeneratedARData {
  values: number[];
  parameters: ARGenerationParams;
  generatedAt: string;
}
```

### Integration with TimeSeriesPage

**New Feature: "Run on Random AR(n) Data" Option**

1. Add button/link on main page: "تولید و تحلیل داده AR تصادفی" (Generate and Analyze Random AR Data)
2. When clicked, display dialog with:
   - AR order selection (1-5)
   - Sample size input (default: 100)
   - Generate button
3. On generation:
   - Create random AR(n) data
   - Populate time series input
   - Trigger automatic analysis
   - Trigger AR parameter estimation
   - Display results for comparison

**Data Flow**:
```
User clicks "Run on Random AR(n) Data"
    ↓
Dialog displays order and sample size options
    ↓
User selects order and confirms
    ↓
Random AR(n) data generated
    ↓
Time series input populated
    ↓
Automatic analysis triggered
    ↓
AR parameter estimation triggered
    ↓
Results displayed
```

### API Considerations

The random data generation can be done either:
1. **Frontend**: Use a JavaScript library (e.g., simple-statistics) to generate AR data
2. **Backend**: Create new endpoint `/api/generate-ar-data` if backend support is available

For this design, we assume frontend generation using a simple AR data generator function.

## Testing Strategy

### Unit Testing

Unit tests should cover specific examples and edge cases:

1. **Order Selection**
   - Test default order is 1
   - Test selecting each order (1-15)
   - Test order state updates correctly

2. **Button States**
   - Test button is enabled initially
   - Test button is disabled during estimation
   - Test button is re-enabled after success
   - Test button is re-enabled after error

3. **Farsi Labels**
   - Test all Farsi labels are present
   - Test loading text appears during estimation
   - Test error messages are in Farsi

4. **Layout Structure**
   - Test two-column grid layout exists
   - Test MME and MSE cards are rendered
   - Test nested card structure for orders

5. **Error Handling**
   - Test error message displays on API failure
   - Test alert() is called with error message
   - Test console.error() is called

6. **Differencing Integration**
   - Test AR controls remain visible after differencing
   - Test AR results are cleared when differencing is applied
   - Test AR estimation works on differenced data

7. **Random Data Generation**
   - Test AR(n) data generation with various orders
   - Test generated data has correct length
   - Test generated data can be used for analysis
   - Test random data option appears on main page

### Property-Based Testing

Property-based tests should verify universal properties across many generated inputs:

1. **Property 2: API Request Correctness**
   - Generate random time series data (100-1000 values)
   - Generate random orders (1-15)
   - Mock API and verify request payload
   - Minimum 100 iterations

2. **Property 9: Numeric Formatting**
   - Generate random numeric values
   - Format using component logic
   - Verify exactly 5 decimal places
   - Minimum 100 iterations

3. **Property 7: Parameter Organization**
   - Generate random parameter results
   - Render component
   - Verify organization by order
   - Minimum 100 iterations

4. **Property 14: Dark Mode Reactivity**
   - Generate random isDarkMode values
   - Toggle between true/false
   - Verify component re-renders
   - Minimum 100 iterations

### Testing Configuration

- Use Vitest for unit and property-based testing
- Use fast-check for property-based test generation
- Minimum 100 iterations per property test
- Mock fetch API for integration testing
- Tag each test with feature and property reference

