import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";

export const UnknownChainImage: FunctionComponent<{
  size: string;
}> = ({ size }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        backgroundColor:
          theme.mode === "light"
            ? ColorPalette["gray-200"]
            : ColorPalette["gray-400"],
        borderRadius: "999999px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="6"
        height="8"
        fill="none"
        viewBox="0 0 6 8"
      >
        <path
          fill={
            theme.mode === "light"
              ? ColorPalette["white"]
              : ColorPalette["gray-100"]
          }
          d="M2.35 5.87v-.074c.005-.49.054-.88.146-1.169a1.79 1.79 0 01.403-.703c.174-.179.383-.342.628-.49.158-.1.3-.211.426-.335.126-.124.226-.266.3-.426.074-.16.11-.338.11-.533 0-.234-.055-.437-.165-.608a1.105 1.105 0 00-.442-.395 1.294 1.294 0 00-.608-.142 1.38 1.38 0 00-.58.126 1.1 1.1 0 00-.459.395c-.12.176-.19.404-.209.683H.7c.018-.474.138-.874.36-1.2a2.1 2.1 0 01.876-.746C2.302.084 2.706 0 3.148 0c.484 0 .908.09 1.271.272.363.18.645.43.845.754.203.322.304.697.304 1.126 0 .294-.046.56-.138.797a1.979 1.979 0 01-.395.628 2.695 2.695 0 01-.608.49c-.224.139-.405.284-.545.434-.137.15-.237.327-.3.533-.063.205-.097.459-.103.762v.075H2.35zm.596 2.401a.766.766 0 01-.556-.229.764.764 0 01-.233-.56c0-.216.077-.4.233-.553a.76.76 0 01.556-.233c.214 0 .398.078.553.233a.74.74 0 01.237.553.752.752 0 01-.11.398.817.817 0 01-.285.285.753.753 0 01-.395.106z"
        />
      </svg>
    </div>
  );
};
