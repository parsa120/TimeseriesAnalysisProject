import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import FileUploadArea from "../components/FileUploadArea";
import AnalysisControls from "../components/AnalysisControls";
import ResultsDisplay from "../components/ResultsDisplay";
import ARParameterEstimationControls from "../components/ARParameterEstimationControls";
import ARParametersDisplay from "../components/ARParametersDisplay";
import TimeSeriesChart from "../components/TimeSeriesChart";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { TimeSeriesData, AnalysisResults } from "../utils/types";
import * as XLSX from "xlsx";

const API_BASE_URL = "http://localhost:5000/api";

interface ContextType {
  isDarkMode: boolean;
}

export default function TimeSeriesPage() {
  const { isDarkMode } = useOutletContext<ContextType>();
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(
    null
  );
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [differencedDataStack, setDifferencedDataStack] = useState<
    Array<{ data: TimeSeriesData; results: AnalysisResults }>
  >([]);
  const [isDifferencing, setIsDifferencing] = useState(false);
  const [arOrder, setArOrder] = useState<number>(1);
  const [isEstimatingAR, setIsEstimatingAR] = useState(false);


  // Get the current data being analyzed (most recent differenced data or original)
  const currentData = differencedDataStack.length > 0 
    ? differencedDataStack[differencedDataStack.length - 1].data 
    : timeSeriesData;
  
  const currentResults = differencedDataStack.length > 0 
    ? differencedDataStack[differencedDataStack.length - 1].results 
    : analysisResults;

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setAnalysisResults(null);
    setDifferencedDataStack([]);

    try {
      let csvContent: string;

      if (file.name.endsWith(".csv")) {
        csvContent = await file.text();
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        csvContent = XLSX.utils.sheet_to_csv(firstSheet);
      } else {
        throw new Error("فرمت فایل پشتیبانی نمی‌شود");
      }

      const response = await fetch(`${API_BASE_URL}/parse-csv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: csvContent }),
      });

      if (!response.ok) {
        throw new Error("خطا در پردازش فایل");
      }

      const parsedData: TimeSeriesData = await response.json();
      setTimeSeriesData(parsedData);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("خطا در خواندن فایل. لطفاً فایل معتبر بارگذاری کنید.");
    }
  };

  const handleCalculate = async () => {
    if (!timeSeriesData) return;

    setIsCalculating(true);
    setArOrder(1);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: timeSeriesData.values }),
      });

      if (!response.ok) {
        throw new Error("خطا در محاسبه");
      }

      const results: AnalysisResults = await response.json();

      try {
        const aiResponse = await fetch(`${API_BASE_URL}/ai-feedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            autocorrelations: results.autocorrelations,
            trendCoefficient: results.trendCoefficient,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          results.aiFeedback = aiData.feedback;
        }
      } catch (aiError) {
        console.error("Error fetching AI feedback:", aiError);
      }

      setAnalysisResults({ ...results, arParameters: undefined });
    } catch (error) {
      console.error("Error analyzing data:", error);
      alert("خطا در محاسبه. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDifference = async () => {
    if (!currentData) return;

    setIsDifferencing(true);
    setArOrder(1);

    try {
      const response = await fetch(`${API_BASE_URL}/difference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: currentData.values,
          labels: currentData.labels,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در دیفرانسیل گیری");
      }

      const result = await response.json();
      
      // Add new differenced data to the stack
      setDifferencedDataStack((prevStack) => [
        ...prevStack,
        {
          data: result.data,
          results: { ...result.analysis, arParameters: undefined },
        },
      ]);
    } catch (error) {
      console.error("Error differencing data:", error);
      alert("خطا در دیفرانسیل گیری. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsDifferencing(false);
    }
  };

  const handleEstimateAR = async (order: number) => {
    // Determine which data to use - differenced or original
    const dataToUse = currentData;
    if (!dataToUse) return;

    setIsEstimatingAR(true);

    try {
      const response = await fetch(`${API_BASE_URL}/estimate-ar-parameters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: dataToUse.values,
          order: order,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در تخمین پارامترهای AR");
      }

      const results = await response.json();

      // Update the appropriate results object based on which data is being analyzed
      if (differencedDataStack.length > 0) {
        // Update the most recent differenced results
        setDifferencedDataStack((prevStack) => {
          const newStack = [...prevStack];
          newStack[newStack.length - 1] = {
            ...newStack[newStack.length - 1],
            results: {
              ...newStack[newStack.length - 1].results,
              arParameters: results,
            },
          };
          return newStack;
        });
      } else {
        // Update original analysis results
        setAnalysisResults((prevResults) => {
          if (!prevResults) return prevResults;
          return {
            ...prevResults,
            arParameters: results,
          };
        });
      }
    } catch (error) {
      console.error("Error estimating AR parameters:", error);
      alert("خطا در تخمین پارامترهای AR");
    } finally {
      setIsEstimatingAR(false);
    }
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {!uploadedFile && (
            <FileUploadArea
              onFileUpload={handleFileUpload}
              isDarkMode={isDarkMode}
            />
          )}

          {uploadedFile && (
            <div
              className={`
              text-center p-4 rounded-lg
              ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"}
            `}
            >
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                فایل بارگذاری شده:{" "}
                <span
                  className={isDarkMode ? "text-gray-200" : "text-gray-900"}
                >
                  {uploadedFile.name}
                </span>
              </p>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setTimeSeriesData(null);
                  setAnalysisResults(null);
                  setDifferencedDataStack([]);
                }}
                className={`text-sm mt-2 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                } hover:underline`}
              >
                بارگذاری فایل جدید
              </button>
            </div>
          )}

          {timeSeriesData && (
            <TimeSeriesChart
              data={timeSeriesData}
              results={analysisResults}
              isDarkMode={isDarkMode}
            />
          )}

          {timeSeriesData && !analysisResults && (
            <AnalysisControls
              onCalculate={handleCalculate}
              isDarkMode={isDarkMode}
              isCalculating={isCalculating}
            />
          )}

          {analysisResults && (
            <>
              <ResultsDisplay
                results={analysisResults}
                isDarkMode={isDarkMode}
              />
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
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleCalculate}
                  variant="outline"
                  className={`
                    rounded-lg
                    ${
                      isDarkMode
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  محاسبه مجدد
                </Button>
                <Button
                  onClick={handleDifference}
                  variant="outline"
                  disabled={isDifferencing}
                  className={`
                    rounded-lg
                    ${
                      isDarkMode
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  {isDifferencing ? "در حال پردازش..." : "دیفرانسیل گیری"}
                </Button>
                <Button
                  onClick={() => navigate("/ar-generation")}
                  variant="outline"
                  className={`
                    rounded-lg
                    ${
                      isDarkMode
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  تولید و تحلیل داده AR تصادفی
                </Button>
              </div>
            </>
          )}

          {differencedDataStack.length > 0 && (
            <>
              {differencedDataStack.map((item, index) => (
                <div key={index}>
                  <div
                    className={`border-t pt-12 ${
                      isDarkMode ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <h2
                      className={`text-2xl font-bold mb-6 text-center ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      داده‌های دیفرانسیل شده - سطح {index + 1}
                    </h2>
                    <TimeSeriesChart
                      data={item.data}
                      results={item.results}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <ResultsDisplay
                    results={item.results}
                    isDarkMode={isDarkMode}
                  />
                  {index === differencedDataStack.length - 1 && (
                    <>
                      <ARParameterEstimationControls
                        onEstimate={handleEstimateAR}
                        isDarkMode={isDarkMode}
                        isEstimating={isEstimatingAR}
                        selectedOrder={arOrder}
                        onOrderChange={setArOrder}
                      />
                      {item.results.arParameters && (
                        <ARParametersDisplay
                          parameters={item.results.arParameters}
                          isDarkMode={isDarkMode}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      <footer
        className={`
        border-t mt-24 transition-colors duration-200
        ${
          isDarkMode
            ? "border-gray-800 bg-gray-900"
            : "border-gray-200 bg-white"
        }
      `}
      >
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            ابزارهای تحلیل بیشتر به زودی...
          </p>
        </div>
      </footer>
    </>
  );
}
