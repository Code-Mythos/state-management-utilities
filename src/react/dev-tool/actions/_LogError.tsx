import React from "react";

import { useHandlers } from "../providers/HandlersProvider";
import { isErrorLog, logError } from "../providers/LogsProvider";
import { useSelectedLog } from "../providers/SelectedLogProvider";
import { useStyles } from "../providers/StylesProvider";

export function LogError() {
  const userIsError = useHandlers()?.isError;
  const userOnLogError = useHandlers()?.onLogError;
  const styles = useStyles();

  const [selectedLog] = useSelectedLog();

  const isError = React.useMemo<boolean>(() => {
    return userIsError ? userIsError(selectedLog) : isErrorLog(selectedLog);
  }, [selectedLog, userIsError]);

  const onLogError = React.useCallback(() => {
    return userOnLogError ? userOnLogError(selectedLog) : logError(selectedLog);
  }, [selectedLog, userOnLogError]);

  return !isError ? null : (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={styles["dashboard-icon"]}
      onClick={onLogError}
    >
      <title>Log Error</title>
      <g>
        <g id="Error_1_">
          <g id="Error">
            <circle cx="16" cy="16" r="16" />
            <path
              d="M14.5,25h3v-3h-3V25z M14.5,6v13h3V6H14.5z"
              id="Exclamatory_x5F_Sign"
              fill="rgba(255,255,255,0.5)"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
