import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface Props {
  inline?: boolean;
}

export default function ThemeToggle({ inline = false }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors
        ${inline
          ? "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          : "fixed top-4 right-4 z-50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
        }`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} className="text-yellow-400" />}
    </button>
  );
}