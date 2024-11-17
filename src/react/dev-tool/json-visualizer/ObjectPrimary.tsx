import React from "react";

import { ArrayComponent } from "./Array";
import { ObjectComponent } from "./Object";

export function ObjectPrimary({ data }: { data: any }) {
  const isArray = React.useMemo(() => Array.isArray(data), [data]);

  return isArray ? (
    <ArrayComponent data={data} />
  ) : (
    <ObjectComponent data={data} />
  );
}
