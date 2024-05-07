import React, {
  FunctionComponent,
  Children,
  isValidElement,
  PropsWithChildren,
} from "react";
import { Gutter } from "../gutter";
import styled from "styled-components";
import { flattenFragment } from "../../utils";

export interface StackProps {
  gutter?: string;
  alignX?: "left" | "right" | "center";

  flex?: number;
}

const Styles = {
  Container: styled.div<StackProps>`
    ${({ flex }) => {
      if (flex != null) {
        return `
          flex: ${flex};
        `;
      }
    }}

    display: flex;
    flex-direction: column;
    align-items: ${({ alignX }) => {
      switch (alignX) {
        case "left": {
          return "flex-start";
        }
        case "right": {
          return "flex-end";
        }
        case "center": {
          return "center";
        }
      }
    }};
  `,
};

export const Stack: FunctionComponent<PropsWithChildren<StackProps>> = ({
  children,
  gutter,
  ...otherProps
}) => {
  const array = Children.toArray(flattenFragment(children));

  return (
    <Styles.Container {...otherProps}>
      {array.map((child, i) => {
        if (isValidElement(child) && child.type === Gutter) {
          return <React.Fragment key={i}>{child}</React.Fragment>;
        }

        if (!gutter || i === array.length - 1) {
          return <React.Fragment key={i}>{child}</React.Fragment>;
        }

        if (i + 1 < array.length) {
          const next = array[i + 1];
          if (isValidElement(next) && next.type === Gutter) {
            return <React.Fragment key={i}>{child}</React.Fragment>;
          }
        }

        return (
          <React.Fragment key={i}>
            {child}
            <Gutter size={gutter} direction="vertical" />
          </React.Fragment>
        );
      })}
    </Styles.Container>
  );
};
