import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useState } from "react";
import { StyleProp, TouchableWithoutFeedback, ViewStyle } from "react-native";

import { useStore } from "../../../stores";

export interface ObiModeToggleProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ObiModeToggle = observer<ObiModeToggleProps>((props) => {
  const [pressed, setPressed] = useState(0);
  const { settingsStore } = useStore();

  useEffect(() => {
    if (pressed >= 5) {
      settingsStore.toggleObiMode();
      setPressed(0);
    }
  }, [settingsStore, pressed]);

  return (
    <TouchableWithoutFeedback
      {...props}
      onPress={() => {
        setPressed((pressed) => pressed + 1);
      }}
    />
  );
});
