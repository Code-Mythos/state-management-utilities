import type { CenterRecordType } from "../../../center";

import React from "react";

const HandlersContext = React.createContext<ReactDevToolHandlers>(undefined);

export const HandlersProvider = HandlersContext.Provider;

export function useHandlers() {
  return React.useContext(HandlersContext);
}

export type ReactDevToolHandlers =
  | {
      onImport?: () => Promise<void>;

      onExport?: () => Promise<void>;

      onLogError?: (record: CenterRecordType | undefined) => void;

      isError?: (record: CenterRecordType | undefined) => boolean;

      onRestore?: (record: CenterRecordType | undefined) => Promise<void>;

      onClear?: () => Promise<void>;
    }
  | undefined;
