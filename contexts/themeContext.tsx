import { AppearanceType, COLOR_SCHEMES } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance } from "react-native";

type ThemeContextType = {
  appearance: AppearanceType;
  setTheme: (option: AppearanceType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [appearance, setAppearance] = useState<AppearanceType>("System");

  useEffect(() => {
    AsyncStorage.getItem("theme").then((saved) => {
      if (saved && saved in COLOR_SCHEMES) {
        Appearance.setColorScheme(COLOR_SCHEMES[saved as AppearanceType]);
        setAppearance(saved as AppearanceType);
      }
    });
  }, []);

  const setTheme = (option: AppearanceType) => {
    Appearance.setColorScheme(COLOR_SCHEMES[option]);
    AsyncStorage.setItem("theme", option);
    setAppearance(option);
  };

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeProvider = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error(
      "useThemeContext must be used within a ThemeContextProvider",
    );
  return context;
};
