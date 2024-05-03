import React, { FunctionComponent } from "react";
import { ImageBackground, View } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { SimpleGradient } from "components/svg";

export type BackgroundMode =
  | "image"
  | "gradient"
  | "secondary"
  | "tertiary"
  | null;

export const ScreenBackground: FunctionComponent<{
  backgroundMode: BackgroundMode;
  backgroundBlur?: boolean;
  isTransparentHeader?: boolean;
}> = ({ backgroundMode, backgroundBlur, isTransparentHeader = false }) => {
  const style = useStyle();

  return backgroundMode ? (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: isTransparentHeader ? -200 : -225,
        bottom: isTransparentHeader ? -200 : -100,
      }}
    >
      {backgroundMode === "gradient" ? (
        <SimpleGradient
          degree={style.get("background-gradient").degree}
          stops={style.get("background-gradient").stops}
          fallbackAndroidImage={
            style.get("background-gradient").fallbackAndroidImage
          }
        />
      ) : backgroundMode === "image" ? (
        <ImageBackground
          source={require("assets/bg.png")}
          resizeMode="contain"
          style={style.flatten([
            "flex-1",
            "justify-center",
            "background-color-indigo-900",
          ])}
        >
          <BlurBackground
            backgroundBlur={backgroundBlur}
            borderRadius={0}
            blurType="dark"
            blurIntensity={10}
            containerStyle={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
        </ImageBackground>
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
