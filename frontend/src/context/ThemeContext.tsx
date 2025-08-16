import React, { ReactNode, createContext, useContext, useState } from "react";

interface ThemeContextData {
  theme: string;
  toggleTheme: (color?: string) => void;
}

export const ThemeContext = createContext<ThemeContextData>({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const ThemeContextProvider = ({ children }: any) => {
  const [theme, setTheme] = useState<string>("light");

  const toggleTheme = (color?: string) => {
    if (color) {
      setTheme(color);
    } else {
      setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
