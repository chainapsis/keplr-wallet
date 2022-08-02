import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { SimpleGradient } from "../svg";
import { useStyle } from "../../styles";

export type BackgroundMode = "gradient" | "secondary" | "tertiary" | null;

export const ScreenBackground: FunctionComponent<{
  backgroundMode: BackgroundMode;
}> = ({ backgroundMode }) => {
  const style = useStyle();

  return backgroundMode ? (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: -100,
        bottom: -100,
      }}
    >
      {backgroundMode === "gradient" ? (
        <SimpleGradient
          degree={style.get("background-gradient").degree}
          stops={style.get("background-gradient").stops}
        />
      ) : backgroundMode === "secondary" ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: style.get("color-background-secondary").color,
          }}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: style.get("color-background-tertiary").color,
          }}
        />
      )}
    </View>
  ) : null;
};
