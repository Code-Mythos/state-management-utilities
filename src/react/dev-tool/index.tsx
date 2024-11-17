/* istanbul ignore file */

import React from "react";

import { useDisableLog } from "../useDisableLog";
import { Memo } from "./Memo";
import {
  HandlersProvider,
  ReactDevToolHandlers,
} from "./providers/HandlersProvider";
import { StylesProvider } from "./providers/StylesProvider";

export function ReactDevTool({
  enable = process.env.NODE_ENV === "development",
  handlers,
  styles,
}: {
  enable?: boolean;
  handlers?: ReactDevToolHandlers;
  styles?: Record<string, string>;
}) {
  useDisableLog({ isDisabled: !enable });

  return (
    <React.Suspense>
      <StylesProvider styles={styles}>
        <HandlersProvider value={handlers}>
          <Memo>
            <ReactDevToolLazy enable={enable} />
          </Memo>
        </HandlersProvider>
      </StylesProvider>
    </React.Suspense>
  );
}

const ReactDevToolLazy = React.lazy(() => import("./Component"));

export type { ReactDevToolHandlers };
