import OriginalBottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { MutableRefObject, ReactNode } from "react";

export interface BottomSheetProps {
  children: ReactNode;
  bottomSheetRef: MutableRefObject<OriginalBottomSheet>;
}

export type BottomSheetRef = OriginalBottomSheet;

export function BottomSheet({ children, bottomSheetRef }: BottomSheetProps) {
  return (
    <OriginalBottomSheet
      handleIndicatorStyle={{ backgroundColor: "#FFFFFF" }}
      backgroundStyle={{ backgroundColor: "#100F1E" }}
      handleStyle={{ backgroundColor: "transparent" }}
      snapPoints={["50%"]}
      enablePanDownToClose={true}
      ref={bottomSheetRef}
      index={-1}
    >
      <BottomSheetView
        style={{
          flex: 1,
          backgroundColor: "transparent",
          position: "relative",
        }}
      >
        {children}
      </BottomSheetView>
    </OriginalBottomSheet>
  );
}
