import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useState } from "react";
import { StyleProp, TouchableWithoutFeedback, ViewStyle } from "react-native";

import { useStore } from "../../../stores";

export interface DemoModeToggleProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const DemoModeToggle = observer<DemoModeToggleProps>((props) => {
  const [pressed, setPressed] = useState(0);
  const { demoStore } = useStore();

  useEffect(() => {
    if (pressed >= 5) {
      demoStore.toggleDemoMode();
      setPressed(0);
    }
  }, [demoStore, pressed]);

  return (
    <TouchableWithoutFeedback
      {...props}
      onPress={() => {
        setPressed((pressed) => pressed + 1);
      }}
    />
  );
});
