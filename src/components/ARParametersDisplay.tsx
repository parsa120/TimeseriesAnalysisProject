import { Card } from './ui/card';
import type { ParameterEstimationResult } from '../utils/types';

interface ARParametersDisplayProps {
  parameters: ParameterEstimationResult;
  isDarkMode: boolean;
}

// Helper function to extract order number from key (e.g., "ar1" -> 1, "ar12" -> 12)
const extractOrderNumber = (key: string): number => {
  const match = key.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

// Helper function to sort keys numerically
const sortOrderKeys = (keys: string[]): string[] => {
  return keys.sort((a, b) => extractOrderNumber(a) - extractOrderNumber(b));
};

export default function ARParametersDisplay({ parameters, isDarkMode }: ARParametersDisplayProps) {
  const mmeKeys = sortOrderKeys(Object.keys(parameters.mme));
  const mseKeys = sortOrderKeys(Object.keys(parameters.mse));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* MME Results */}
      <Card className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`mb-4 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          تخمین AR - روش گشتاورها (MME)
        </h3>
        <div className="space-y-4">
          {mmeKeys.map((key) => (
            <div key={key} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {key.toUpperCase()}
              </h4>
              <div className="space-y-2">
                {Object.entries(parameters.mme[key]).map(([param, value]) => (
                  <div key={param} className="flex justify-between items-center">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {param}
                    </span>
                    <span className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {typeof value === 'number' ? value.toFixed(5) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MSE Results */}
      <Card className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`mb-4 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          تخمین AR - روش خطای میانگین (MSE)
        </h3>
        <div className="space-y-4">
          {mseKeys.map((key) => (
            <div key={key} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {key.toUpperCase()}
              </h4>
              <div className="space-y-2">
                {Object.entries(parameters.mse[key]).map(([param, value]) => (
                  <div key={param} className="flex justify-between items-center">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {param}
                    </span>
                    <span className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {typeof value === 'number' ? value.toFixed(5) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}