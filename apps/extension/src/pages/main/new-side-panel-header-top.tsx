import React, { FunctionComponent } from "react";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { XAxis } from "../../components/axis";
import { Gutter } from "../../components/gutter";
import { Subtitle4 } from "../../components/typography";
import { useTheme } from "styled-components";

export const NewSidePanelHeaderTop: FunctionComponent<{
  onClick: () => void;
  onCloseClick: () => void;
}> = ({ onClick, onCloseClick }) => {
  const theme = useTheme();

  return (
    <Box
      position="relative"
      height="3rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["blue-50"]
          : ColorPalette["gray-650"]
      }
      alignX="center"
      alignY="center"
      style={{
        overflow: "hidden",
      }}
      cursor="pointer"
      onClick={(e) => {
        e.preventDefault();

        onClick();
      }}
    >
      <GradientDeco />

      <Box
        color={
          theme.mode === "light"
            ? ColorPalette["blue-400"]
            : ColorPalette["gray-50"]
        }
        zIndex={1}
      >
        <XAxis alignY="center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2V14M5.2 2H10.8C11.9201 2 12.4802 2 12.908 2.21799C13.2843 2.40973 13.5903 2.71569 13.782 3.09202C14 3.51984 14 4.0799 14 5.2V10.8C14 11.9201 14 12.4802 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.4802 14 11.9201 14 10.8 14H5.2C4.07989 14 3.51984 14 3.09202 13.782C2.71569 13.5903 2.40973 13.2843 2.21799 12.908C2 12.4802 2 11.9201 2 10.8V5.2C2 4.07989 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2Z"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <Gutter size="0.25rem" />
          <Subtitle4
            style={{
              textDecoration: "underline",
            }}
          >
            Wanna keep Keplr by your side?
          </Subtitle4>
        </XAxis>
      </Box>

      <Box
        alignY="center"
        color={
          theme.mode === "light"
            ? ColorPalette["blue-400"]
            : ColorPalette["gray-50"]
        }
        style={{
          position: "absolute",
          height: "100%",
          right: "0.75rem",
        }}
      >
        <div
          style={{
            width: "1.5rem",
            height: "1.5rem",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            cursor: "pointer",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onCloseClick();
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M12 12L4 4"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Box>
    </Box>
  );
};

const GradientDeco: FunctionComponent = () => {
  const theme = useTheme();

  if (theme.mode === "light") {
    return (
      <svg
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-0.5rem",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
        width="282"
        height="48"
        fill="none"
        viewBox="0 0 282 48"
      >
        <g filter="url(#filter0_f_12854_34107)">
          <path
            fill="url(#paint0_linear_12854_34107)"
            fillOpacity="0.4"
            d="M55.067 48.212a170.42 170.42 0 01171.154-.334L242 57H40l15.067-8.788z"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_12854_34107"
            width="282"
            height="112"
            x="0"
            y="-15"
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              result="effect1_foregroundBlur_12854_34107"
              stdDeviation="20"
            />
          </filter>
          <linearGradient
            id="paint0_linear_12854_34107"
            x1="151.786"
            x2="162.113"
            y1="-34.83"
            y2="54.947"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.299" stopColor="#3943F5" stopOpacity="0.2" />
            <stop offset="1" stopColor="#3943F5" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg
      style={{
        position: "absolute",
        left: "50%",
        bottom: "-0.5rem",
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="282"
      height="48"
      fill="none"
      viewBox="0 0 282 48"
    >
      <g filter="url(#filter0_f_12479_12702)">
        <path
          fill="url(#paint0_linear_12479_12702)"
          fillOpacity="0.7"
          d="M55.067 48.212a170.42 170.42 0 01171.154-.334L242 57H40l15.067-8.788z"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_12479_12702"
          width="282"
          height="112"
          x="0"
          y="-15"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur
            result="effect1_foregroundBlur_12479_12702"
            stdDeviation="20"
          />
        </filter>
        <linearGradient
          id="paint0_linear_12479_12702"
          x1="151.786"
          x2="162.113"
          y1="-34.83"
          y2="54.947"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.31" stopColor="#B893FF" stopOpacity="0.2" />
          <stop offset="0.679" stopColor="#8B4DFF" />
          <stop offset="1" stopColor="#3943F5" />
        </linearGradient>
      </defs>
    </svg>
  );
};
