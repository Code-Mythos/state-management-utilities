import React from "react";

import { useStyles } from "../providers/StylesProvider";

export function Collapse({
  children,
  length,
  type,
}: {
  length: number;
  type: "array" | "object";
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const styles = useStyles();

  return !length ? (
    <div>{`${type === "array" ? "[ ]" : "{ }"} ${length}`}</div>
  ) : isCollapsed ? (
    <div onClick={() => setIsCollapsed(false)}>{`▼ ${
      type === "array" ? "[ ... ]" : "{ ... }"
    } ${length}`}</div>
  ) : (
    <div className={styles["data-visualizer-col"]}>
      <div onClick={() => setIsCollapsed(true)}>{`▲ ${
        type === "array" ? "[" : "{"
      }`}</div>

      <div className={styles["data-visualizer-collapse-content"]}>
        {children}
      </div>

      <div>{type === "array" ? "]" : "}"}</div>
    </div>
  );
}
