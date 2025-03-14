/* istanbul ignore file */
import type { Hydrated } from "src/center";

import React from "react";
import { center } from "src/center";

import { Memo } from "./dev-tool/Memo";

export function DehydrateStateManager({
  pageProps,
  children,
}: {
  pageProps?: { hydrated?: Hydrated } & Record<string, any>;
  children: React.ReactNode;
}) {
  const dehydratedRef = React.useRef<Record<string, true>>({});

  // const dehydrate = React.useCallback(() => {
  //   if (!props?.hydrated || dehydratedRef.current === props.hydrated) return;

  //   dehydratedRef.current = props.hydrated;

  //   center.dehydrate(props.hydrated);
  // }, [props?.hydrated]);

  React.useEffect(() => {
    const hydratedIDs = dehydratedRef.current;

    if (!pageProps?.hydrated || hydratedIDs[pageProps.hydrated.id]) return;

    center.dehydrate(pageProps.hydrated);

    hydratedIDs[pageProps.hydrated.id] = true;
    dehydratedRef.current = hydratedIDs;
  }, [pageProps?.hydrated]);

  return (
    <DehydrateContext.Provider value={pageProps?.hydrated}>
      <Memo>{children}</Memo>
    </DehydrateContext.Provider>
  );
}

const DehydrateContext = React.createContext<Hydrated | undefined>(undefined);

export function useDehydrate() {
  // return React.useContext(DehydrateContext)?.();
  return React.useContext(DehydrateContext);
}
