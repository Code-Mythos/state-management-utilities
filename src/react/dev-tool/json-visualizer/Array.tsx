import React from "react";

import { Collapse } from "./_Collapse";
import { DetectType } from "./_DetectType";

export function ArrayComponent({ data }: { data: any[] }) {
  const uid = React.useId();

  return (
    <Collapse length={data.length} type="array">
      {data.map((item, index) => (
        <DetectType
          name={index.toString()}
          data={item}
          key={`${index}-${uid}`}
        />
      ))}
    </Collapse>
  );
}
