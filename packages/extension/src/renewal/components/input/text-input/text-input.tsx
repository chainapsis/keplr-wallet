import React, { forwardRef } from "react";
import { TextInputProps } from "./types";
import { Styles } from "./styles";

// eslint-disable-next-line react/display-name
export const TextInput = forwardRef<
  HTMLInputElement,
  TextInputProps & React.InputHTMLAttributes<HTMLInputElement>
>(({ className, style, label, paragraph, error, ...props }, ref) => {
  return (
    <Styles.Container
      className={className}
      style={style}
      removeBottomMargin={props.removeBottomMargin}
    >
      {label ? <Styles.Label>{label}</Styles.Label> : null}
      <Styles.TextInput
        {...props}
        paragraph={paragraph}
        error={error}
        ref={ref}
      />
      {error || paragraph ? (
        <div
          style={{
            position: "relative",
          }}
        >
          <Styles.SubText error={error} paragraph={paragraph}>
            {error || paragraph}
          </Styles.SubText>
        </div>
      ) : null}
    </Styles.Container>
  );
});
