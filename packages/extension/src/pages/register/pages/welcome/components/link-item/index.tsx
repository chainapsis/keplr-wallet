import React, { FunctionComponent } from "react";
import { Box } from "../../../../../../components/box";
import { ColorPalette } from "../../../../../../styles";
import { YAxis } from "../../../../../../components/axis";
import { ChainImageFallback } from "../../../../../../components/image";
import { Gutter } from "../../../../../../components/gutter";

export const LinkItem: FunctionComponent<{
  title: string;
  paragraph: string;
}> = ({ title, paragraph }) => {
  return (
    <Box
      padding="1rem 1.5rem 1.5rem 1.5rem"
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="2rem"
    >
      <YAxis>
        <Box width="2.5rem">
          <ChainImageFallback src={undefined} alt="service-image" />
        </Box>

        <Gutter size="1rem" />

        <Box
          style={{
            fontWeight: 500,
            fontSize: "0.875rem",
            color: ColorPalette["gray-200"],
          }}
        >
          {title}
        </Box>

        <Gutter size="0.25rem" />

        <Box
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: ColorPalette["white"],
          }}
        >
          {paragraph}
        </Box>
      </YAxis>
    </Box>
  );
};
