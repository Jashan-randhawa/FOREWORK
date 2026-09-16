import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "../ui/button";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`h-8 px-2.5 flex items-center gap-1.5 text-xs transition-colors rounded-md border ${
        isDark
          ? "bg-[#1F1B26] border-[#3D2166] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white hover:border-[#6B3AC2]"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300"
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-700" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;
