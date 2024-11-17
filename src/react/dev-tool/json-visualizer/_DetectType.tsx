import React from "react";

import { useStyles } from "../providers/StylesProvider";
import { BigIntComponent } from "./BigInt";
import { BooleanComponent } from "./Boolean";
import { FunctionComponent } from "./Function";
import { NullComponent } from "./Null";
import { NumberComponent } from "./Number";
import { ObjectPrimary } from "./ObjectPrimary";
import { StringComponent } from "./String";
import { SymbolComponent } from "./Symbol";
import { UndefinedComponent } from "./Undefined";

export function DetectType({ data, name }: { data: any; name: string }) {
  const styles = useStyles();
  const type = React.useMemo<keyof typeof TYPES>(() => {
    if (data === null) return "null";

    return typeof data;
  }, [data]);

  const Component = React.useMemo<React.FC<{ data: any }>>(
    () => TYPES[type],
    [type]
  );

  return (
    <div className={styles["data-visualizer-row"]}>
      {!name ? null : (
        <div className={styles["data-visualizer-name"]}>{name}:</div>
      )}

      <Component data={data as any} />
    </div>
  );
}

const TYPES = Object.freeze({
  undefined: UndefinedComponent,
  function: FunctionComponent,
  boolean: BooleanComponent,
  bigint: BigIntComponent,
  number: NumberComponent,
  object: ObjectPrimary,
  string: StringComponent,
  symbol: SymbolComponent,
  null: NullComponent,
});
