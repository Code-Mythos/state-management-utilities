import React from "react";
import PulseLoader from "react-spinners/PulseLoader";

import { useLogs } from "../providers/LogsProvider";
import { useStyles } from "../providers/StylesProvider";

export function LogsStatus() {
  const { isUpdating, logs, isEnabled } = useLogs();
  const styles = useStyles();

  return (
    <h2
      className={`${styles["dashboard-status"]} ${styles["dashboard-status-font"]}`}
    >
      {!isEnabled ? (
        <span style={{ color: "red" }}>Disabled</span>
      ) : isUpdating ? (
        <React.Fragment>
          <span>Updating</span>
          <span>
            <PulseLoader
              color="white"
              size="0.75rem"
              speedMultiplier={0.65}
              className={styles["dashboard-status-processing"]}
            />
          </span>
        </React.Fragment>
      ) : (
        <span>
          <span>{`${logs.length} Records`}</span>
          {/* <span className={styles["dashboard-action-success"]}>{"✔"}</span> */}
        </span>
      )}
    </h2>
  );
}
