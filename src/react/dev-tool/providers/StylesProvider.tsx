import React from "react";

export function StylesProvider({
  styles = placeholder,
  children,
}: {
  children: React.ReactNode;
  styles?: Record<string, string>;
}) {
  return (
    <StylesContext.Provider value={styles}>{children}</StylesContext.Provider>
  );
}

const placeholder = {};
const StylesContext = React.createContext<Record<string, string>>(placeholder);

export function useStyles() {
  return React.useContext(StylesContext);
}
