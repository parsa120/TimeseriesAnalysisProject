import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./components/ui/button";
import FileUploadArea from "./components/FileUploadArea";
import AnalysisControls from "./components/AnalysisControls";
import ResultsDisplay from "./components/ResultsDisplay";
import TimeSeriesChart from "./components/TimeSeriesChart";
import type { TimeSeriesData, AnalysisResults } from "./utils/types";
import * as XLSX from "xlsx";

const API_BASE_URL = "http://localhost:5000/api";

export default function App() {
  const [arParameters, setArParameters] = useState<ParameterEstimationResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(
    null
  );
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [differencedData, setDifferencedData] = useState<TimeSeriesData | null>(
    null
  );
  const [differencedResults, setDifferencedResults] =
    useState<AnalysisResults | null>(null);
  const [isDifferencing, setIsDifferencing] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);
  const handleEstimateARParameters = async () => {
    if (!timeSeriesData) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/estimate-ar-parameters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: timeSeriesData.values,
          order: 3, // or make this configurable
        }),
      });
  
      if (!response.ok) {
        throw new Error("خطا در تخمین پارامترهای AR");
      }
  
      const result = await response.json();
      setArParameters(result);
    } catch (error) {
      console.error("Error estimating AR parameters:", error);
      alert("خطا در تخمین پارامترهای AR");
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setAnalysisResults(null);
    setDifferencedData(null);
    setDifferencedResults(null);

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

      // Call Python API to parse CSV
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

    try {
      // Call Python API to analyze time series
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

      // Fetch AI feedback
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
        // Don't fail the whole operation if AI feedback fails
      }

      setAnalysisResults(results);
    } catch (error) {
      console.error("Error analyzing data:", error);
      alert("خطا در محاسبه. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDifference = async () => {
    if (!timeSeriesData) return;

    setIsDifferencing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/difference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: timeSeriesData.values,
          labels: timeSeriesData.labels,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در دیفرانسیل گیری");
      }

      const result = await response.json();
      setDifferencedData(result.data);
      setDifferencedResults(result.analysis);
    } catch (error) {
      console.error("Error differencing data:", error);
      alert("خطا در دیفرانسیل گیری. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsDifferencing(false);
    }
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Header */}
      <header
        className={`
        border-b transition-colors duration-200
        ${
          isDarkMode
            ? "border-gray-800 bg-gray-900"
            : "border-gray-200 bg-white"
        }
      `}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>
            KNTU Time series analysis
          </h1>
          <Button
            onClick={() => setIsDarkMode(!isDarkMode)}
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Upload Area */}
          {!uploadedFile && (
            <FileUploadArea
              onFileUpload={handleFileUpload}
              isDarkMode={isDarkMode}
            />
          )}

          {/* File Info */}
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
                  setDifferencedData(null);
                  setDifferencedResults(null);
                }}
                className={`text-sm mt-2 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                } hover:underline`}
              >
                بارگذاری فایل جدید
              </button>
            </div>
          )}

          {/* Chart - Always show if data is available */}
          {timeSeriesData && (
            <TimeSeriesChart
              data={timeSeriesData}
              results={analysisResults}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Analysis Controls */}
          {timeSeriesData && !analysisResults && (
            <AnalysisControls
              onCalculate={handleCalculate}
              isDarkMode={isDarkMode}
              isCalculating={isCalculating}
            />
          )}

          {/* Results */}
          
          {analysisResults && (
            <>
              <ResultsDisplay
                results={analysisResults}
                isDarkMode={isDarkMode}
              />
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
                <Button
      onClick={handleEstimateARParameters}
      className="..."
    >
      تخمین پارامترهای AR
    </Button>  محاسبه مجدد
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
              </div>
            </>
          )}

          {/* Differenced Data Section */}
          {differencedData && differencedResults && (
            <>
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
                  داده‌های دیفرانسیل شده
                </h2>
                <TimeSeriesChart
                  data={differencedData}
                  results={differencedResults}
                  isDarkMode={isDarkMode}
                />
              </div>
              <ResultsDisplay
                results={differencedResults}
                isDarkMode={isDarkMode}
              />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
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
    </div>
  );
}
