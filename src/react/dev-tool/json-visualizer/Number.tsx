import React from "react";

export function NumberComponent({ data }: { data: number }) {
  return <div>{data.toString()}</div>;
}
