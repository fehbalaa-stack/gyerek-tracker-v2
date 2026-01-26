import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "default",
  setTheme: (theme: string) => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    // Ez a varázslat: rárakja a HTML elemre a témát (green, blue-yellow, stb.)
    const root = window.document.documentElement;
    root.setAttribute("data-color-theme", theme);
    // Dark módot is bekapcsoljuk alapértelmezetten, mert neonhoz az illik
    root.classList.add('dark'); 
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);