interface ParameterEstimationResult {
    parameterName: string;
    parameterValue: number;
    confidenceInterval: [number, number];
}

interface AnalysisResults {
    arParameters: number[];
    maParameters: number[];
}

export { ParameterEstimationResult, AnalysisResults };