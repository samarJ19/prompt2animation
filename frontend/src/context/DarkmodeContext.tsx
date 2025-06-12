import { createContext, useContext, useEffect, useState } from "react";
export interface DarkModeContextType {
     isDarkMode: boolean;
     setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
     toggleDarkMode: () => void;
   };
const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = ({ children }:{children:any}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
    useEffect(() => {
      // Check for saved theme preference or default to system preference
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
  
      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    }, []);
    const toggleDarkMode = () => {
      if (isDarkMode) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        setIsDarkMode(false);
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        setIsDarkMode(true);
      }
    };

  const value = {
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode
  };

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
};