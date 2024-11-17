import React from "react";

export function VisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = React.useState(false);

  return (
    <VisibilityContext.Provider value={value}>
      {children}
    </VisibilityContext.Provider>
  );
}

const VisibilityContext = React.createContext<
  [
    isVisible: boolean,
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
  ]
>([false, () => {}]);

export function useVisibility() {
  const context = React.useContext(VisibilityContext);

  if (!context) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }

  return context;
}
