import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ARParameterEstimationControlsProps {
  onEstimate: (order: number) => void;
  isDarkMode: boolean;
  isEstimating: boolean;
  selectedOrder: number;
  onOrderChange: (order: number) => void;
}

export default function ARParameterEstimationControls({
  onEstimate,
  isDarkMode,
  isEstimating,
  selectedOrder,
  onOrderChange,
}: ARParameterEstimationControlsProps) {
  const handleEstimateClick = () => {
    onEstimate(selectedOrder);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label
          className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          مرتبه AR
        </label>
        <Select value={selectedOrder.toString()} onValueChange={(value) => onOrderChange(parseInt(value))}>
          <SelectTrigger
            className={`w-32 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((order) => (
              <SelectItem key={order} value={order.toString()}>
                {order}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleEstimateClick}
        disabled={isEstimating}
        className={`
          rounded-lg px-8 py-5 transition-all duration-200
          ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
        `}
      >
        {isEstimating ? 'در حال محاسبه...' : 'تخمین پارامترهای AR'}
      </Button>
    </div>
  );
}
