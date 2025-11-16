"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Palette } from "lucide-react";

export default function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const themeConfig = [
    { name: "light", icon: Sun, label: "Light", colors: "bg-white text-gray-900" },
    { name: "dark", icon: Moon, label: "Dark", colors: "bg-gray-900 text-white" },
    { name: "ocean", icon: Palette, label: "Ocean", colors: "bg-blue-900 text-blue-50" },
    { name: "forest", icon: Palette, label: "Forest", colors: "bg-green-900 text-green-50" },
    { name: "sunset", icon: Palette, label: "Sunset", colors: "bg-orange-900 text-orange-50" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Select theme"
      >
        <Palette className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">
                SELECT THEME
              </p>
              {themeConfig.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.name}
                    onClick={() => {
                      setTheme(t.name);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      theme === t.name
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{t.label}</span>
                    {theme === t.name && (
                      <span className="ml-auto text-primary-600">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
