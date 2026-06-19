import React, { createContext, useContext, ReactNode } from 'react';

// Cosmic Slate Dark Palette
export const cosmicSlate = {
  background: {
    canvas: "#03050a", // Primary off-black background
    card: "#070a13",   // Secondary nested boards/cards
    elevated: "#0b1220", // Further nested/elevated boards
  },
  accent: {
    indigo: "#4a85fd", // Sourcing Intel & Accents
    violet: "#a855f7",  // Deep purple/violet secondary accent
  },
  status: {
    success: "#00d4a0", // Compliance Success (Emerald green)
    warning: "#ff9b36", // Warnings & Alerts (Safety amber)
    error: "#ff3d5a"    // Audit Violations & Errors (Crimson red)
  },
  text: {
    primary: "#dde6ff", 
    secondary: "#8ba4cc",     
    muted: "#5d7899",
  },
  border: {
    subtle: "rgba(255, 255, 255, 0.05)",
    accent: "rgba(74, 133, 253, 0.15)"
  }
};

const ThemeContext = createContext(cosmicSlate);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={cosmicSlate}>
      <div style={{ backgroundColor: cosmicSlate.background.canvas, color: cosmicSlate.text.primary, minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
