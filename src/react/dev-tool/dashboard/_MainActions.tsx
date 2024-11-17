import React from "react";

import { ClearLogs } from "../actions/_ClearLogs";
import { CloseDashboard } from "../actions/_Close";
import { ExportLogs } from "../actions/_ExportLogs";
import { ImportLogs } from "../actions/_ImportLogs";
import { Power } from "../actions/_Power";
import { useStyles } from "../providers/StylesProvider";

export function MainActions() {
  const styles = useStyles();

  return (
    <div className={styles["dashboard-main-actions"]}>
      <div>
        <Power />
        <ImportLogs />
        <ClearLogs />
      </div>

      <div>
        <ExportLogs />
        <CloseDashboard />
      </div>
    </div>
  );
}
