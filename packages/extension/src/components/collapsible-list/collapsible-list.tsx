import React, { FunctionComponent, useState } from "react";
import { CollapsibleListProps } from "./types";
import { Stack } from "../stack";
import { Box } from "../box";
import { Styles } from "./styles";
import { Subtitle4 } from "../typography";
import { ColorPalette } from "../../styles";
import { ArrowDownIcon, ArrowUpIcon } from "../icon";
import { Column, Columns } from "../column";
import { VerticalCollapseTransition } from "../transition/vertical-collapse";

export const CollapsibleList: FunctionComponent<CollapsibleListProps> = ({
  title,
  right,
  alwaysShown,
  items,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Stack>
      <Styles.Title
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <Columns sum={1} alignY="center">
          {title}

          <Column weight={1} />

          {right ? (
            <Subtitle4 style={{ color: ColorPalette["gray-300"] }}>
              {right}
            </Subtitle4>
          ) : null}

          <Box paddingLeft="0.25rem">
            {isExpanded ? (
              <ArrowDownIcon
                width="1rem"
                height="1rem"
                color={ColorPalette["gray-300"]}
              />
            ) : (
              <ArrowUpIcon
                width="1rem"
                height="1rem"
                color={ColorPalette["gray-300"]}
              />
            )}
          </Box>
        </Columns>
      </Styles.Title>

      {alwaysShown ? <Stack gutter="0.5rem">{alwaysShown}</Stack> : null}

      <Styles.Items>
        <VerticalCollapseTransition collapsed={isExpanded}>
          <Stack gutter="0.5rem">{items}</Stack>
        </VerticalCollapseTransition>
      </Styles.Items>
    </Stack>
  );
};
