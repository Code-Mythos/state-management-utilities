/* istanbul ignore file */

import React from "react";

import { center } from "../center";

export function useDisableLog({ isDisabled }: { isDisabled: boolean }) {
  React.useEffect(() => {
    if (!isDisabled) return;
    center.enableLog = false;
  }, [isDisabled]);
}
