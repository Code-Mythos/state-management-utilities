import React from "react";

import { useHandlers } from "../providers/HandlersProvider";
import { importLogs } from "../providers/LogsProvider";
import { useStyles } from "../providers/StylesProvider";

export function ImportLogs() {
  const userImport = useHandlers()?.onImport;
  const styles = useStyles();

  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      onClick={userImport ?? importLogs}
      className={styles["dashboard-icon"]}
    >
      <title>Import Logs</title>
      <path d="M10 8L14 8V10L8 16L2 10V8H6V0L10 4.76995e-08V8Z" />
    </svg>
  );
}
