import React, { forwardRef } from "react";
import { TextInputProps } from "./types";
import { Styles } from "./styles";

// eslint-disable-next-line react/display-name
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, style, label, paragraph, error, ...props }, ref) => {
  return (
    <Styles.Container className={className} style={style}>
      {label ? <Styles.Label>{label}</Styles.Label> : null}
      <Styles.TextInput
        {...props}
        as="textarea"
        isTextarea={true}
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
