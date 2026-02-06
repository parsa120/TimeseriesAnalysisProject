import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import TimeSeriesChart from "../components/TimeSeriesChart";
import ARParameterEstimationControls from "../components/ARParameterEstimationControls";
import ARParametersDisplay from "../components/ARParametersDisplay";
import { generateARData } from "../utils/arDataGenerator";
import type { TimeSeriesData, AnalysisResults } from "../utils/types";

const API_BASE_URL = "http://localhost:5000/api";

interface ContextType {
  isDarkMode: boolean;
}

export default function ARRandomGenerationPage() {
  const { isDarkMode } = useOutletContext<ContextType>();
  const navigate = useNavigate();

  // State
  const [phi1, setPhi1] = useState("0.5");
  const [sampleSize, setSampleSize] = useState("100");
  const [generatedData, setGeneratedData] = useState<TimeSeriesData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [arOrder, setArOrder] = useState(1);
  const [isEstimatingAR, setIsEstimatingAR] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setAnalysisResults(null);

    try {
      const phi = parseFloat(phi1) || 0.5;
      const n = parseInt(sampleSize) || 100;

      const values = generateARData(1, { phi1: phi }, n);
      const data: TimeSeriesData = {
        values,
        labels: Array.from({ length: values.length }, (_, i) => `${i + 1}`),
      };

      setGeneratedData(data);
    } catch (error) {
      console.error("Error generating data:", error);
      alert("خطا در تولید داده. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!generatedData) return;

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: generatedData.values }),
      });

      if (!response.ok) throw new Error("خطا در تحلیل");

      const results = await response.json();
      setAnalysisResults(results);
    } catch (error) {
      console.error("Error analyzing:", error);
      // Still show AR estimation controls even if analysis fails
      setAnalysisResults({
        autocorrelations: [],
        trendCoefficient: 0,
        hasTrend: false,
      });
    }
  };

  const handleEstimateAR = async (order: number) => {
    if (!generatedData) return;

    setIsEstimatingAR(true);

    try {
      const response = await fetch(`${API_BASE_URL}/estimate-ar-parameters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: generatedData.values,
          order: order,
        }),
      });

      if (!response.ok) throw new Error("خطا در تخمین");

      const results = await response.json();
      setAnalysisResults((prev) => {
        if (!prev) return prev;
        return { ...prev, arParameters: results };
      });
    } catch (error) {
      console.error("Error estimating AR:", error);
      alert("خطا در تخمین پارامترهای AR");
    } finally {
      setIsEstimatingAR(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              تولید داده AR(1)
            </h1>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              داده تصادفی با مدل AR(1) تولید کنید و پارامترها را تخمین بزنید
            </p>
          </div>

          {/* Input Section */}
          <Card className={`p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="space-y-4">
              <div>
                <Label className={isDarkMode ? "text-gray-200" : "text-gray-900"}>
                  ضریب φ₁ (بین -0.99 و 0.99)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="-0.99"
                  max="0.99"
                  value={phi1}
                  onChange={(e) => setPhi1(e.target.value)}
                  className={`mt-2 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                />
              </div>

              <div>
                <Label className={isDarkMode ? "text-gray-200" : "text-gray-900"}>
                  تعداد نمونه
                </Label>
                <Input
                  type="number"
                  min="10"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                  className={`mt-2 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full ${isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white`}
              >
                {isGenerating ? "در حال تولید..." : "تولید داده"}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {generatedData && (
            <div className="space-y-6">
              <TimeSeriesChart data={generatedData} results={analysisResults} isDarkMode={isDarkMode} />

              <div className="flex gap-4">
                <Button
                  onClick={handleAnalyze}
                  className={`flex-1 ${isDarkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"} text-white`}
                >
                  تحلیل
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className={`flex-1 ${isDarkMode ? "border-gray-700 text-gray-300" : "border-gray-300 text-gray-700"}`}
                >
                  بازگشت
                </Button>
              </div>

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
                    <ARParametersDisplay parameters={analysisResults.arParameters} isDarkMode={isDarkMode} />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className={`border-t mt-12 ${isDarkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}>
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
            تولید و تحلیل داده AR(1)
          </p>
        </div>
      </footer>
    </div>
  );
}
