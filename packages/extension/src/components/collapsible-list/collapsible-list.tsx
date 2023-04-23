import React, { FunctionComponent, useState } from "react";
import { CollapsibleListProps } from "./types";
import { Stack } from "../stack";
import { Box } from "../box";
import { Subtitle4 } from "../typography";
import { ColorPalette } from "../../styles";
import { ArrowDownIcon, ArrowUpIcon } from "../icon";
import { Column, Columns } from "../column";
import { VerticalCollapseTransition } from "../transition/vertical-collapse";
import { Gutter } from "../gutter";

export const CollapsibleList: FunctionComponent<CollapsibleListProps> = ({
  title,
  items,
  lenAlwaysShown,
}) => {
  if (!lenAlwaysShown || lenAlwaysShown < 0) {
    lenAlwaysShown = items.length;
  }

  const [isExpanded, setIsExpanded] = useState(true);

  const alwaysShown = items.slice(0, lenAlwaysShown);
  const hidden = items.slice(lenAlwaysShown);

  return (
    <Stack>
      <Box
        cursor={hidden.length > 0 ? "pointer" : undefined}
        marginBottom="0.5rem"
        onClick={(e) => {
          e.preventDefault();

          if (hidden.length > 0) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <Columns sum={1} alignY="center">
          {title}

          <Column weight={1} />

          {hidden.length > 0 ? (
            <React.Fragment>
              <Subtitle4 style={{ color: ColorPalette["gray-300"] }}>
                {items.length}
              </Subtitle4>
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
            </React.Fragment>
          ) : null}
        </Columns>
      </Box>

      <Stack gutter="0.5rem">{alwaysShown}</Stack>

      <VerticalCollapseTransition collapsed={isExpanded}>
        <Gutter size="0.5rem" />
        <Stack gutter="0.5rem">{hidden}</Stack>
      </VerticalCollapseTransition>
    </Stack>
  );
};
