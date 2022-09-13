import React, { FunctionComponent, Children, isValidElement } from "react";
import { Gutter } from "../gutter";
import { Box } from "../box";

export type StackProps = {
  gutter?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  alignItems?: "left" | "center" | "right";
  justifyContent?: "start" | "center" | "end";
};

export const Stack: FunctionComponent<StackProps> = ({
  children,
  gutter,
  height,
  minHeight,
  maxHeight,
  flex,
  flexGrow,
  flexShrink,
  alignItems,
  justifyContent,
}) => {
  const array = Children.toArray(children);

  return (
    <Box
      display="flex"
      flexDirection="vertical"
      height={height}
      minHeight={minHeight}
      maxHeight={maxHeight}
      flex={flex}
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      alignItems={alignItems}
      justifyContent={justifyContent}
    >
      {array.map((child, i) => {
        if (isValidElement(child) && child.type === Gutter) {
          return child;
        }

        if (!gutter || i === array.length - 1) {
          return child;
        }

        if (i + 1 < array.length) {
          const next = array[i + 1];
          if (isValidElement(next) && next.type === Gutter) {
            return child;
          }
        }

        return (
          // eslint-disable-next-line react/jsx-key
          <React.Fragment>
            {child}
            <Gutter size={gutter} />
          </React.Fragment>
        );
      })}
    </Box>
  );
};
