import React from "react";

export function BooleanComponent({ data }: { data: boolean }) {
  return <div>{data.toString()}</div>;
}
