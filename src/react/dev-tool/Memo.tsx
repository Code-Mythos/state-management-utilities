import React from "react";

export const Memo = React.memo(MemoBase, () => true) as typeof MemoBase;
function MemoBase({ children }: { children: React.ReactNode }) {
  return <React.Fragment>{children}</React.Fragment>;
}
