import React from "react";

import { ButtonVisibility } from "./actions/_Visibility";
import { Dashboard } from "./dashboard";
import { Memo } from "./Memo";
import { FilteredLogsProvider } from "./providers/FilteredLogsProvider";
import { LogsProvider } from "./providers/LogsProvider";
import { SelectedLogProvider } from "./providers/SelectedLogProvider";
import {
  useVisibility,
  VisibilityProvider,
} from "./providers/VisibilityProvider";

export default function ReactDevToolBase({
  enable = process.env.NODE_ENV === "development",
}: {
  enable?: boolean;
}) {
  return !enable ? null : (
    <VisibilityProvider>
      <VisibilityDecider />
    </VisibilityProvider>
  );
}

function VisibilityDecider() {
  const [isVisible] = useVisibility();

  return !isVisible ? (
    <ButtonVisibility />
  ) : (
    <LogsProvider>
      <FilteredLogsProvider>
        <SelectedLogProvider>
          <Memo>
            <Dashboard />
          </Memo>
        </SelectedLogProvider>
      </FilteredLogsProvider>
    </LogsProvider>
  );
}
