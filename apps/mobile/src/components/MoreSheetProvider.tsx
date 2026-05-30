import React, { createContext, useContext, useState, useCallback } from "react";
import MoreBottomSheet from "@/components/MoreBottomSheet";

interface MoreSheetContextValue {
  showMoreSheet: () => void;
  hideMoreSheet: () => void;
}

const MoreSheetContext = createContext<MoreSheetContextValue | null>(null);

export function MoreSheetProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const showMoreSheet = useCallback(() => setVisible(true), []);
  const hideMoreSheet = useCallback(() => setVisible(false), []);

  return (
    <MoreSheetContext.Provider value={{ showMoreSheet, hideMoreSheet }}>
      {children}
      <MoreBottomSheet visible={visible} onClose={hideMoreSheet} />
    </MoreSheetContext.Provider>
  );
}

export function useMoreSheet() {
  const context = useContext(MoreSheetContext);
  if (!context) {
    throw new Error("useMoreSheet must be used within MoreSheetProvider");
  }
  return context;
}

export { MoreSheetContext };