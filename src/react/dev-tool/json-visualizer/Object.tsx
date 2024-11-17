import React from "react";

import { Collapse } from "./_Collapse";
import { DetectType } from "./_DetectType";

export function ObjectComponent({ data }: { data: Record<string, any> }) {
  const uid = React.useId();
  const entities = React.useMemo(() => Object.entries(data), [data]);

  return (
    <Collapse length={entities.length} type="object">
      {entities.map(([key, value], index) => (
        <DetectType name={key} data={value} key={`${index}-${uid}`} />
      ))}
    </Collapse>
  );
}
