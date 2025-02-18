import React, { ReactNode } from "react";
import { FunctionComponent, useState } from "react";
import { Box } from "../box";
import { ArrowLeftIcon, ArrowRightIcon } from "../icon";
import { ColorPalette } from "../../styles";
import { IconProps } from "../icon/types";

// Pixel values
const BUTTON_WIDTH = 312;
const BUTTON_GAP = 12;
const SCREEN_PADDING_X = 12;
const MAX_SCREEN_WIDTH = 540;

export const FullHorizontalSlider: FunctionComponent<{
  Buttons: ReactNode[];
}> = ({ Buttons }) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const handleNext = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % 2);
  };
  const handlePrev = () => {
    setSlideIndex((prevIndex) => (prevIndex - 1) % 2);
  };

  const containerWidthPixels =
    BUTTON_WIDTH * Buttons.length +
    SCREEN_PADDING_X * Buttons.length +
    BUTTON_GAP * (Buttons.length - 1);

  const getTranslateX = () => {
    if (slideIndex === 0) {
      return "0";
    }

    if (window.innerWidth <= MAX_SCREEN_WIDTH) {
      return `-${containerWidthPixels - window.innerWidth}px`;
    }

    return `-${containerWidthPixels - MAX_SCREEN_WIDTH}px`;
  };

  if (Buttons.length === 0) {
    return null;
  }

  if (Buttons.length === 1) {
    return Buttons[0];
  }

  return (
    <Box
      style={{ overflow: "hidden" }}
      width={`calc(100% + ${SCREEN_PADDING_X * 2}px)`}
      position="relative"
      paddingLeft="0.75rem"
      marginLeft={`-${SCREEN_PADDING_X}px`}
    >
      <Box
        width={`${containerWidthPixels}px`}
        style={{
          display: "flex",
          flexDirection: "row",
          transform: `translateX(${getTranslateX()})`,
          transition: "transform 0.3s ease",
          gap: "0.75rem",
        }}
      >
        {Buttons.map((Button, index) => (
          <Box key={index} style={{ width: BUTTON_WIDTH }}>
            {Button}
          </Box>
        ))}
      </Box>

      {slideIndex === 0 ? (
        <SliderButton Icon={ArrowRightIcon} handleNext={handleNext} />
      ) : (
        <SliderButton Icon={ArrowLeftIcon} handlePrev={handlePrev} />
      )}
    </Box>
  );
};

const SliderButton: FunctionComponent<{
  handleNext?: () => void;
  handlePrev?: () => void;
  Icon: React.FunctionComponent<IconProps>;
}> = ({ handleNext, handlePrev, Icon }) => {
  return (
    <Box
      as="button"
      onClick={handleNext ?? handlePrev}
      marginLeft="auto"
      position="absolute"
      style={{
        display: "flex",
        alignItems: handleNext ? "flex-end" : "flex-start",
        justifyContent: "center",
        top: "0",
        right: handleNext ? "0" : "auto",
        left: handlePrev ? "0" : "auto",
        border: "none",
        cursor: "pointer",
        transition: "opacity 0.3s ease, background 0.3s ease",
      }}
      height="100%"
      width="70px"
      opacity={0}
      backgroundColor="transparent"
      hover={{
        opacity: 1,
        background: `linear-gradient(${handleNext ? "270deg" : "90deg"}, ${
          ColorPalette["gray-700"]
        } 0%, rgba(9, 9, 10, 0.00) 100%)`,
      }}
    >
      <Box
        borderColor={ColorPalette["gray-400"]}
        backgroundColor={ColorPalette["gray-500"]}
        borderRadius="10rem"
        padding="0.5rem"
        margin={handleNext ? "0 0.5rem 0 0" : "0 0 0 0.5rem"}
      >
        <Icon width="1rem" height="1rem" color={ColorPalette["gray-200"]} />
      </Box>
    </Box>
  );
};
