import React from "react";

import { useHandlers } from "../providers/HandlersProvider";
import { exportLogs } from "../providers/LogsProvider";
import { useStyles } from "../providers/StylesProvider";

export function ExportLogs() {
  const userExport = useHandlers()?.onExport;
  const styles = useStyles();

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles["dashboard-icon"]}
      onClick={userExport ?? exportLogs}
    >
      <title>Export Logs</title>
      <path d="M6 8L2 8L2 6L8 5.24536e-07L14 6L14 8L10 8L10 16L6 16L6 8Z" />
    </svg>
  );
}
