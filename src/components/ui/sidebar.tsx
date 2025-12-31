
'use client';

import React, { createContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isManuallyToggled: boolean;
  setManuallyToggled: (isOpen: boolean) => void;
  isHovering: boolean;
  setHovering: (isHovering: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isManuallyToggled: true,
  setManuallyToggled: () => {},
  isHovering: false,
  setHovering: () => {},
});

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isManuallyToggled, setManuallyToggled] = useState(false);
  const [isHovering, setHovering] = useState(false);

  return (
    <SidebarContext.Provider value={{ isManuallyToggled, setManuallyToggled, isHovering, setHovering }}>
      {children}
    </SidebarContext.Provider>
  );
};
