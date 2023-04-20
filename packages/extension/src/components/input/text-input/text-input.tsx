import React, { forwardRef } from "react";
import { TextInputProps } from "./types";
import { Styles } from "./styles";
import { Column, Columns } from "../../column";
import { Box } from "../../box";
import { VerticalResizeTransition } from "../../transition";

// eslint-disable-next-line react/display-name
export const TextInput = forwardRef<
  HTMLInputElement,
  TextInputProps & React.InputHTMLAttributes<HTMLInputElement>
>(
  (
    {
      className,
      style,
      label,
      paragraph,
      error,
      rightLabel,
      left,
      right,
      ...props
    },
    ref
  ) => {
    return (
      <Styles.Container className={className} style={style}>
        <Columns sum={1} alignY="center">
          {label ? <Styles.Label>{label}</Styles.Label> : null}
          <Column weight={1} />
          {rightLabel ? <Box>{rightLabel}</Box> : null}
        </Columns>

        <Styles.TextInputContainer
          paragraph={paragraph}
          error={error}
          {...props}
        >
          <Columns sum={1}>
            {left ? (
              <Box alignY="center" marginLeft="1rem">
                <Styles.Icon>
                  <Box>{left}</Box>
                </Styles.Icon>
              </Box>
            ) : null}

            <Column weight={1}>
              <Styles.TextInput
                {...props}
                paragraph={paragraph}
                error={error}
                ref={ref}
              />
            </Column>
            {right ? (
              <Box alignY="center" marginRight="1rem">
                <Styles.Icon>
                  <Box>{right}</Box>
                </Styles.Icon>
              </Box>
            ) : null}
          </Columns>
        </Styles.TextInputContainer>

        <VerticalResizeTransition transitionAlign="top">
          {error || paragraph ? (
            <Styles.SubText error={error} paragraph={paragraph}>
              {error || paragraph}
            </Styles.SubText>
          ) : null}
        </VerticalResizeTransition>
      </Styles.Container>
    );
  }
);
