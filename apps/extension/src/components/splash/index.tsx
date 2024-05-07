import React, { FunctionComponent, useLayoutEffect } from "react";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { animated, useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../styles/spring";
import { useTheme } from "styled-components";

// This is the splash screen that is shown when the extension is loaded.
// 일반적으로 이 화면은 아주 잠깐만 뜨는게 목표기 때문에
// 로고는 1초 이후에 보여준다.
// 로고가 보이게 되면 사실 뭔가 잘못된거다.
export const Splash: FunctionComponent = () => {
  const theme = useTheme();
  const opacity = useSpringValue(0, {
    config: defaultSpringConfig,
  });

  useLayoutEffect(() => {
    const id = setTimeout(() => {
      opacity.start(1);
    }, 1000);

    return () => {
      clearTimeout(id);
    };
  });

  return (
    <Box
      position="fixed"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["light-gradient"]
          : ColorPalette["gray-700"]
      }
      style={{
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999999999999,
      }}
    >
      <Box alignX="center">
        <animated.img
          src={require("../../public/assets/logo-256.png")}
          alt="logo"
          style={{
            opacity,
            marginTop: "10.5rem",
            width: "6.875rem",
            height: "6.875rem",
          }}
        />
      </Box>
    </Box>
  );
};
