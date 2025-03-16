/* istanbul ignore file */
import type { Hydrated } from "../center";

import React from "react";

import { center } from "../center";
import { Memo } from "./dev-tool/Memo";

export function DehydrateStateManager({
  pageProps,
  children,
}: {
  pageProps?: { hydrated?: Hydrated } & Record<string, any>;
  children: React.ReactNode;
}) {
  const dehydratedRef = React.useRef<Record<string, true>>({});

  React.useEffect(() => {
    const hydratedIDs = dehydratedRef.current;

    if (!pageProps?.hydrated || hydratedIDs[pageProps.hydrated.id]) return;

    center.dehydrate(pageProps.hydrated);

    hydratedIDs[pageProps.hydrated.id] = true;
    dehydratedRef.current = hydratedIDs;
  }, [pageProps?.hydrated]);

  return (
    <DehydrateContext.Provider value={pageProps?.hydrated}>
      {children}
    </DehydrateContext.Provider>
  );
}

const DehydrateContext = React.createContext<Hydrated | undefined>(undefined);

export function useDehydrate() {
  // return React.useContext(DehydrateContext)?.();
  return React.useContext(DehydrateContext);
}
