import React, { FunctionComponent, useLayoutEffect, useState } from "react";
import { SpecialButtonProps } from "./types";
import { Styles } from "./styles";
import { LoadingIcon } from "../icon";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { to, useSpringValue } from "@react-spring/web";

const springConfig = {
  mass: 0.6,
  tension: 270,
  friction: 21,
};

export const SpecialButton: FunctionComponent<SpecialButtonProps> = ({
  onClick,
  left,
  text,
  right,
  isLoading,
  textOverrideIcon,
}) => {
  const gradient1Pos = "16.15%";
  const gradient1DefaultColor = ColorPalette["blue-400"];
  const gradient1HoverColor = "#2C4BE2";
  const gradient1 = useSpringValue(gradient1DefaultColor, {
    config: springConfig,
  });
  const gradient2Pos = "100%";
  const gradient2DefaultColor = ColorPalette["blue-400"];
  const gradient2HoverColor = "#7A59FF";
  const gradient2 = useSpringValue(gradient2DefaultColor, {
    config: springConfig,
  });

  const defaultBoxShadowColor = "#2723F700";
  const hoverBoxShadowColor = "#2723F7FF";
  const pressedBoxShadowColor = "#2723F700";
  const boxShadowColor = useSpringValue(defaultBoxShadowColor, {
    config: springConfig,
  });

  const defaultBoxShadowStrength = 0;
  const hoverBoxShadowStrength = 11;
  const pressedBoxShadowStrength = 0;
  const boxShadowStrength = useSpringValue(defaultBoxShadowStrength, {
    config: springConfig,
  });

  const defaultScale = 1;
  const hoverScale = 1.05;
  const pressedScale = 0.95;
  const scale = useSpringValue(defaultScale, { config: springConfig });

  const [isHover, setIsHover] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useLayoutEffect(() => {
    if (isHover) {
      gradient1.start(gradient1HoverColor);
      gradient2.start(gradient2HoverColor);

      scale.start(hoverScale);
      boxShadowColor.start(hoverBoxShadowColor);
      boxShadowStrength.start(hoverBoxShadowStrength);
    } else {
      gradient1.start(gradient1DefaultColor);
      gradient2.start(gradient2DefaultColor);

      scale.start(defaultScale);
      boxShadowColor.start(defaultBoxShadowColor);
      boxShadowStrength.start(defaultBoxShadowStrength);
    }
  }, [
    // Other things except for `isHover` are constant.
    boxShadowColor,
    boxShadowStrength,
    gradient1,
    gradient1DefaultColor,
    gradient2,
    gradient2DefaultColor,
    isHover,
    scale,
  ]);

  useLayoutEffect(() => {
    if (isPressed) {
      scale.start(pressedScale);
      boxShadowColor.start(pressedBoxShadowColor);
      boxShadowStrength.start(pressedBoxShadowStrength);
    }
    // Other things except for `isPressed` are constant.
  }, [boxShadowColor, boxShadowStrength, isPressed, scale]);

  return (
    <Styles.Container>
      <Styles.Button
        isLoading={isLoading}
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => {
          setIsHover(false);
          // 외부에서 마우스가 up 되었을 경우 event가 발생하지 않으므로 여기서도 처리해준다.
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        style={{
          background: to(
            [gradient1, gradient2],
            (g1, g2) =>
              `linear-gradient(90deg, ${g1} ${gradient1Pos}, ${g2} ${gradient2Pos})`
          ),
          transform: to(scale, (s) => `scale(${s})`),
          boxShadow: to(
            [boxShadowColor, boxShadowStrength],
            (c, s) => `0px 0px ${s}px ${c}`
          ),
        }}
      >
        {left ? <Styles.Left>{left}</Styles.Left> : null}

        {isLoading ? (
          <Styles.Loading>
            <LoadingIcon width="1rem" height="1rem" />
          </Styles.Loading>
        ) : null}

        {!isLoading && textOverrideIcon ? (
          <Styles.TextOverrideIcon>{textOverrideIcon}</Styles.TextOverrideIcon>
        ) : null}

        <Box style={{ opacity: isLoading || textOverrideIcon ? 0 : 1 }}>
          {text}
        </Box>

        {right ? <Styles.Right>{right}</Styles.Right> : null}
      </Styles.Button>
    </Styles.Container>
  );
};
