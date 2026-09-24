import React, { createContext, useContext, useState } from 'react';

export interface CityOption {
  name: string;
  state: string;
  icon: string;
}

export const POPULAR_CITIES: CityOption[] = [
  { name: 'Mumbai', state: 'Maharashtra', icon: '🏛️' },
  { name: 'Bengaluru', state: 'Karnataka', icon: '💻' },
  { name: 'Delhi NCR', state: 'Delhi', icon: '🏰' },
  { name: 'Hyderabad', state: 'Telangana', icon: '💎' },
  { name: 'Chennai', state: 'Tamil Nadu', icon: '🌊' },
  { name: 'Pune', state: 'Maharashtra', icon: '⛰️' },
  { name: 'Kolkata', state: 'West Bengal', icon: '🌁' },
  { name: 'Ahmedabad', state: 'Gujarat', icon: '🪁' }
];

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  isCityModalOpen: boolean;
  setIsCityModalOpen: (open: boolean) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('bms_selected_city') || 'Mumbai';
  });
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('bms_selected_city', city);
    setIsCityModalOpen(false);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        isCityModalOpen,
        setIsCityModalOpen
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
