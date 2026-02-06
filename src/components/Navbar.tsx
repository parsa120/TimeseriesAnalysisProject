import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navbar({ isDarkMode, onToggleDarkMode }: NavbarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
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
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>
              KNTU Time series analysis
            </h1>
            <nav className="flex gap-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive("/")
                    ? isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                تحلیل سری زمانی
              </Link>
              <Link
                to="/ma1-generation"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive("/ma1-generation")
                    ? isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                تولید MA(1)
              </Link>
              <Link
                to="/ar-generation"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive("/ar-generation")
                    ? isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                تولید AR(n)
              </Link>
            </nav>
          </div>
          <Button
            onClick={onToggleDarkMode}
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
      </div>
    </header>
  );
}
