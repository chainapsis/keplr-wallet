import React, { FunctionComponent, Children, isValidElement } from "react";
import { Gutter } from "../gutter";
import { Box, BoxProps } from "../box";
import { isFragment } from "react-is";

export interface StackProps extends BoxProps {
  gutter?: string;
}

export const Stack: FunctionComponent<StackProps> = ({
  children,
  gutter,
  ...props
}) => {
  const array = Children.toArray(
    isFragment(children) ? children.props.children : children
  );

  return (
    <Box {...props} display="flex" flexDirection="vertical">
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
