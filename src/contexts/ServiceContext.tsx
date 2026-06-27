/* eslint-disable react-refresh/only-export-components */
// src/contexts/ServiceContext.tsx
import { createContext, useContext, useState, type ReactNode,  } from "react";

interface ServiceContextData {
  showServiceModal: boolean;
  openServiceModal: () => void;
  closeServiceModal: () => void;
  toggleServiceModal: () => void;
}

const ServiceContext = createContext<ServiceContextData | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [showServiceModal, setShowServiceModal] = useState(false);

  const openServiceModal = () => {
    setShowServiceModal(true);
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
  };

  const toggleServiceModal = () => {
    setShowServiceModal((prev) => !prev);
  };

  return (
    <ServiceContext.Provider
      value={{
        showServiceModal,
        openServiceModal,
        closeServiceModal,
        toggleServiceModal,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
};
