import throttle from "lodash.throttle";
import React from "react";
import { PulseLoader } from "react-spinners";
import { FixedSizeList } from "react-window";

import { useFilteredLogs } from "../providers/FilteredLogsProvider";
import { useSelectedLog } from "../providers/SelectedLogProvider";
import { useStyles } from "../providers/StylesProvider";

import type { CenterRecordType } from "../../../center";
export default function Logs() {
  const direction = "vertical";
  const [selectedLog] = useSelectedLog();
  const { filter, filteredLogs, isFiltering, setFilter } = useFilteredLogs();
  const [ulSize, setUlSize] = React.useState({ width: 1, height: 1 });
  const styles = useStyles();

  const onChangeFilter = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
    },
    [setFilter]
  );

  const ulRef = React.useRef<HTMLUListElement>(null);

  const rem = React.useMemo(
    () =>
      parseFloat(window.getComputedStyle(document.documentElement).fontSize),
    []
  );

  React.useLayoutEffect(() => {
    const handler = throttle(
      () => {
        const ulElement = ulRef.current;
        if (!ulElement) return;

        const { width, height } = ulElement.getBoundingClientRect();

        const newSize = {
          width: width <= 0 ? 1 : width,
          height: height <= 0 ? 1 : height,
        };

        setUlSize(newSize);
      },
      250,
      { leading: true, trailing: true }
    );

    handler();

    window.addEventListener("resize", handler);

    return function () {
      window.removeEventListener("resize", handler);
    };
  }, []);

  return (
    <section className={styles["dashboard-visualization-logs"]}>
      <input type="text" value={filter} onChange={onChangeFilter} />

      {isFiltering ? (
        <div className={styles["dashboard-is-filtering dashboard-status-font"]}>
          <span>Filtering</span>
          <PulseLoader
            color="rgba(255, 255, 255, 0.5)"
            size="0.75rem"
            speedMultiplier={0.65}
            className={styles["dashboard-status-processing"]}
          />
        </div>
      ) : (
        <section className={styles["dashboard-visualization-logs-wrapper"]}>
          <ul
            ref={ulRef}
            className={styles["dashboard-visualization-logs-list"]}
          >
            <FixedSizeList
              width={ulSize.width}
              height={ulSize.height}
              itemCount={filteredLogs.length}
              itemSize={3 * rem}
              itemData={filteredLogs}
              layout={direction}
              className={styles["list-virtualized"]}
            >
              {({ index, style, data }) => (
                <Item
                  index={index}
                  style={style}
                  data={data[index]}
                  isSelected={
                    selectedLog?.number === data[index]?.number &&
                    selectedLog?.updatedUID === data[index]?.updatedUID
                  }
                />
              )}
            </FixedSizeList>
          </ul>
        </section>
      )}
    </section>
  );
}

function Item({
  index,
  style,
  data,
  isSelected,
}: {
  index: number;
  style: React.CSSProperties;
  data: CenterRecordType;
  isSelected: boolean;
}) {
  const [, setSelectedLog] = useSelectedLog();
  const styles = useStyles();

  return (
    <li
      style={style}
      onClick={() => setSelectedLog(data)}
      className={styles["dashboard-visualization-logs-list-item-wrapper"]}
    >
      <span
        className={`${styles[`dashboard-visualization-logs-list-item`]} ${
          isSelected ? styles["selected-log"] : ""
        }`}
      >
        <span
          className={
            styles["dashboard-visualization-logs-list-item-description"]
          }
        >
          {data?.updatedUID}
        </span>
        <span>{data?.number}</span>
      </span>
    </li>
  );
}
