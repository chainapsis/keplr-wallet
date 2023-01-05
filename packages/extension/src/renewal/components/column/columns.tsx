import React, { Children, FunctionComponent, isValidElement } from "react";
import { ColumnsProps } from "./types";
import styled from "styled-components";
import { flattenFragment } from "../../utils";
import { Column } from "./column";
import { Gutter } from "../gutter";

const Styles = {
  Container: styled.div<Pick<ColumnsProps, "alignY">>`
    display: flex;
    flex-direction: row;
    align-items: ${({ alignY }) => {
      switch (alignY) {
        case "bottom":
          return "flex-end";
        case "center":
          return "center";
        default:
          return "flex-start";
      }
    }};
  `,
};

export const Columns: FunctionComponent<ColumnsProps> = ({
  children,
  sum,
  align,
  alignY,
  gutter,
}) => {
  const array = Children.toArray(flattenFragment(children));

  let columnWeightSum = 0;
  array.forEach((child) => {
    if (isValidElement(child) && child.type === Column) {
      const weight = child.props.weight;
      if (weight) {
        columnWeightSum += weight;
      }
    }
  });

  const remainingWeight = Math.max(sum - columnWeightSum, 0);

  return (
    <Styles.Container alignY={alignY}>
      {remainingWeight > 0
        ? (() => {
            if (align === "left") {
              return <Column weight={remainingWeight} />;
            }

            if (align === "center") {
              return <Column weight={remainingWeight / 2} />;
            }
          })()
        : null}
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
          <React.Fragment key={i}>
            {child}
            <Gutter size={gutter} direction="horizontal" />
          </React.Fragment>
        );
      })}
      {remainingWeight > 0
        ? (() => {
            if (align === "center") {
              return <Column weight={remainingWeight / 2} />;
            }

            if (align !== "left") {
              return <Column weight={remainingWeight} />;
            }
          })()
        : null}
    </Styles.Container>
  );
};
