import type { CenterRecordType } from "../../../center";

import React from 'react';

import { center } from '../../../center';

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isEnabled, setIsEnabledReact] = React.useState(false);
  const [state, setState] = React.useState<CenterRecordType[]>([]);

  React.useEffect(() => {
    const handler = async () => {
      try {
        setIsUpdating(true);
        setIsEnabledReact(center.enableLog);
        const records = await center.getReverseRecords();
        setState(records);
      } catch (error) {
        console.error(error);
      } finally {
        setIsUpdating(false);
      }
    };

    handler().catch(console.error);

    center.onLog(handler);

    return function () {
      center.onLog(undefined);
    };
  }, []);

  const setIsEnabled = React.useCallback((value: boolean) => {
    center.enableLog = value;
  }, []);

  return (
    <LogsContext.Provider
      value={{ logs: state, isUpdating, isEnabled, setIsEnabled }}
    >
      {children}
    </LogsContext.Provider>
  );
}

const LogsContext = React.createContext<{
  logs: CenterRecordType[];
  isUpdating: boolean;
  isEnabled: boolean;
  setIsEnabled: (value: boolean) => void;
}>({ logs: [], isUpdating: false, isEnabled: false, setIsEnabled: () => {} });

export function useLogs() {
  const context = React.useContext(LogsContext);

  if (!context) {
    throw new Error("useLogs must be used within a LogsProvider");
  }

  return context;
}

async function importLogsOnChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) {
    console.error("No JSON file selected");
    return;
  }

  try {
    const data = await file.text();

    const logs = JSON.parse(data);

    center.records = logs;
  } catch (error) {
    console.error(error);
  }
}

export function importLogs() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = importLogsOnChange as any;
  input.click();
  input.remove();
}

export async function exportLogs() {
  const data = JSON.stringify(center.records ?? [], null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "logs.json";
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

export function restoreStates(record: CenterRecordType | undefined) {
  if (record) center.apply(record);
}

export function clearLogs() {
  center.clearRecords();
}

export function isErrorLog(selected: CenterRecordType | undefined) {
  return Boolean(
    selected?.updatedUID &&
      selected.updatedUID.endsWith("/error") &&
      typeof selected.states?.[selected.updatedUID] === "object" &&
      selected.states[selected.updatedUID]?.stack
  );
}

export function logError(selected: CenterRecordType | undefined) {
  console.error(
    Object.assign(new Error(), selected?.states[selected.updatedUID] ?? {})
  );
}
