/* istanbul ignore file */

import React from "react";
import { center } from "src/center";

import { Memo } from "./dev-tool/Memo";

export function DehydrateStateManager({
  props,
  children,
}: {
  props?: { hydrate: Record<string, any> | undefined } & Record<string, any>;
  children?: React.ReactNode;
}) {
  const isDehydrated = React.useRef<Record<string, any> | undefined>(undefined);

  const dehydrate = React.useCallback(() => {
    if (!props?.hydrate || isDehydrated.current === props.hydrate) return;

    isDehydrated.current = props.hydrate;

    center.dehydrate(props.hydrate);
  }, [props?.hydrate]);

  return (
    <DehydrateContext.Provider value={dehydrate}>
      <Memo>{children}</Memo>
    </DehydrateContext.Provider>
  );
}

const DehydrateContext = React.createContext<(() => void) | undefined>(
  () => {}
);

export function useDehydrate() {
  return React.useContext(DehydrateContext)?.();
}
