/* eslint-disable react-refresh/only-export-components */
// src/contexts/FilterContext.tsx
import { createContext, useContext, useState, type ReactNode,  } from "react";

interface FilterContextData {
  showFilters: boolean;
  toggleFilters: () => void;
  openFilters: () => void;
  closeFilters: () => void;
}

const FilterContext = createContext<FilterContextData | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Função que abre filtros e scrolla para o topo
  const openFilters = () => {
    setShowFilters(true);
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeFilters = () => {
    setShowFilters(false);
  };

  const toggleFilters = () => {
    const newState = !showFilters;
    setShowFilters(newState);
    if (newState) {
      // Se abriu, scroll para o topo
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <FilterContext.Provider
      value={{ showFilters, toggleFilters, openFilters, closeFilters }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};
