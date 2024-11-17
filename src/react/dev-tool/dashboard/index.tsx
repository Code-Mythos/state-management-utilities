import React from 'react';

import { useStyles } from '../providers/StylesProvider';
import { Log } from './_Log';
import Logs from './_Logs';
import { LogsStatus } from './_LogsStatus';
import { MainActions } from './_MainActions';

export function Dashboard() {
  const styles = useStyles();

  return (
    <section className={styles["dashboard"]}>
      <LogsStatus />
      <MainActions />

      <section className={styles["dashboard-visualization"]}>
        <Logs />
        <Log />
      </section>
    </section>
  );
}
