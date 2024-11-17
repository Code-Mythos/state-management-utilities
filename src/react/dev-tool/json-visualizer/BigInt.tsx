import React from "react";

export function BigIntComponent({ data }: { data: bigint }) {
  return <div>{data.toString()}</div>;
}
