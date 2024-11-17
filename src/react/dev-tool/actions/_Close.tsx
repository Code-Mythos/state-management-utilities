import React from "react";

import { useStyles } from "../providers/StylesProvider";
import { useVisibility } from "../providers/VisibilityProvider";

export function CloseDashboard() {
  const [, setIsUpdating] = useVisibility();
  const styles = useStyles();

  return (
    <svg
      viewBox="-1.7 0 20.4 20.4"
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => setIsUpdating(false)}
      className={styles["dashboard-icon"]}
      // style={{ position: "absolute", top: "1.6rem", right: "1.6rem" }}
    >
      <title>Close</title>
      <path d="M16.417 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.917 7.917zm-6.804.01 3.032-3.033a.792.792 0 0 0-1.12-1.12L8.494 9.173 5.46 6.14a.792.792 0 0 0-1.12 1.12l3.034 3.033-3.033 3.033a.792.792 0 0 0 1.12 1.119l3.032-3.033 3.033 3.033a.792.792 0 0 0 1.12-1.12z" />
    </svg>
  );
}
