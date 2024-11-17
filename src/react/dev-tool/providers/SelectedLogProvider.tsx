import React from "react";

import type { CenterRecordType } from "../../../center";

export function SelectedLogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = React.useState<CenterRecordType | undefined>(undefined);

  return (
    <SelectedLogContext.Provider value={value}>
      {children}
    </SelectedLogContext.Provider>
  );
}

const SelectedLogContext = React.createContext<
  [
    selectedLog: CenterRecordType | undefined,
    setSelectedLog: React.Dispatch<
      React.SetStateAction<CenterRecordType | undefined>
    >
  ]
>([undefined, () => {}]);

export function useSelectedLog() {
  const context = React.useContext(SelectedLogContext);

  if (!context) {
    throw new Error("useSelectedLog must be used within a SelectedLogProvider");
  }

  return context;
}
