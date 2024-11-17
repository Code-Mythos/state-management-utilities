import type { CenterRecordType } from "../../../center";

import debounce from "lodash.debounce";
import React from "react";

import { useLogs } from "./LogsProvider";

export function FilteredLogsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logs } = useLogs();
  const [filteredLogs, setFilteredLogs] =
    React.useState<CenterRecordType[]>(logs);
  const [filter, setFilter] = React.useState("");
  const [isFiltering, setIsFiltering] = React.useState(false);

  React.useEffect(() => {
    if (!filter) return setFilteredLogs(logs);

    filterLogs({ logs, filter, setIsFiltering, setFilteredLogs }).catch(
      console.error
    );
  }, [logs, filter]);

  return (
    <FilteredLogsContext.Provider
      value={{ filteredLogs, isFiltering, filter, setFilter }}
    >
      {children}
    </FilteredLogsContext.Provider>
  );
}

const FilteredLogsContext = React.createContext<{
  filteredLogs: CenterRecordType[];
  isFiltering: boolean;
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}>({
  filteredLogs: [],
  isFiltering: false,
  filter: "",
  setFilter: () => {},
});

export function useFilteredLogs() {
  const context = React.useContext(FilteredLogsContext);

  if (!context) {
    throw new Error(
      "useFilteredLogs must be used within a FilteredLogsProvider"
    );
  }

  return context;
}

const filterLogs = debounce(
  async ({
    logs,
    filter,
    setIsFiltering,
    setFilteredLogs,
  }: {
    logs: CenterRecordType[];
    filter: string;
    setIsFiltering: React.Dispatch<React.SetStateAction<boolean>>;
    setFilteredLogs: React.Dispatch<React.SetStateAction<CenterRecordType[]>>;
  }) => {
    setIsFiltering(true);

    setFilteredLogs(
      logs.filter((log) =>
        log.updatedUID.toLowerCase().includes(filter.toLowerCase())
      )
    );

    setIsFiltering(false);
  },
  500,
  {
    leading: true,
    trailing: true,
  }
);
