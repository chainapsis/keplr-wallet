import React, { FunctionComponent } from "react";
import { Box } from "../../../components/box";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { Body3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";

export const CircleButton: FunctionComponent<{
  onClick: () => void;
  icon: React.ReactElement;
  text: string;
  disabled?: boolean;
}> = ({ onClick, icon, text, disabled }) => {
  const [_isHover, setIsHover] = React.useState(false);
  const isHover = disabled ? false : _isHover;

  return (
    <Box
      style={{
        opacity: disabled ? 0.4 : 1,
      }}
      cursor={!disabled ? "pointer" : "not-allowed"}
      onClick={(e) => {
        e.preventDefault();

        if (disabled) {
          return;
        }

        onClick();
      }}
      onHoverStateChange={(hovered) => {
        setIsHover(hovered);
      }}
    >
      <YAxis alignX="center">
        <Box
          width="2.5rem"
          height="2.5rem"
          alignX="center"
          alignY="center"
          borderRadius="999999px"
          backgroundColor={
            !isHover ? ColorPalette["gray-400"] : ColorPalette["gray-400"]
          }
          style={{
            color: !isHover ? ColorPalette["white"] : ColorPalette["gray-200"],
          }}
        >
          {icon}
        </Box>
        <Gutter size="0.375rem" />
        <Box alignX="center" width="1px">
          <Box>
            <Body3
              color={
                !isHover ? ColorPalette["white"] : ColorPalette["gray-100"]
              }
            >
              {text}
            </Body3>
          </Box>
        </Box>
      </YAxis>
    </Box>
  );
};
