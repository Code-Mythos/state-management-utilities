import { format } from "date-fns";
import React from "react";

import { LogError } from "../actions/_LogError";
import { Restore } from "../actions/_Restore";
import { JsonVisualizer } from "../json-visualizer";
import { useSelectedLog } from "../providers/SelectedLogProvider";
import { useStyles } from "../providers/StylesProvider";

export const Log = React.memo(LogBase);

function LogBase() {
  const [selectedLog] = useSelectedLog();
  const styles = useStyles();

  return (
    <section className={styles["dashboard-visualization-log"]}>
      <section className={styles["dashboard-visualization-log-heading"]}>
        {!selectedLog ? (
          <h3 className={styles["dashboard-visualization-log-title"]}>
            {"No Selected Record"}
          </h3>
        ) : (
          <React.Fragment>
            <div
              className={styles["dashboard-visualization-log-heading-titlebar"]}
            >
              <h3 className={styles["dashboard-visualization-log-title"]}>
                {selectedLog.updatedUID}
              </h3>

              <div
                className={
                  styles["dashboard-visualization-log-heading-titlebar-actions"]
                }
              >
                <LogError />

                <Restore />
              </div>
            </div>

            <div className={styles["dashboard-visualization-log-subtitle"]}>
              {format(
                new Date(selectedLog.timestamp),
                "MMM dd, yyy HH:mm:ss.SSS"
              )}
            </div>
          </React.Fragment>
        )}
      </section>

      {!selectedLog ? null : (
        <section className={styles["dashboard-data-visualizer-container"]}>
          <div className={styles["dashboard-data-visualizer-wrapper"]}>
            <JsonVisualizer
              data={selectedLog?.states[selectedLog.updatedUID]}
            />
          </div>
        </section>
      )}
    </section>
  );
}
