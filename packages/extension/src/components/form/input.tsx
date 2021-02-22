import React, { forwardRef, useState } from "react";

import classnames from "classnames";

import {
  FormFeedback,
  FormGroup,
  FormText,
  InputGroup,
  Input as ReactStrapInput,
  Label,
} from "reactstrap";
import { InputType } from "reactstrap/lib/Input";

import styleInput from "./input.module.scss";

import { Buffer } from "buffer/";

export interface InputProps {
  type?: Exclude<InputType, "textarea">;
  label?: string;
  text?: string | React.ReactElement;
  error?: string;

  append?: React.ReactElement;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef<
  HTMLInputElement,
  InputProps & React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { type, label, text, error, append } = props;

  const attributes = { ...props };
  delete attributes.className;
  delete attributes.type;
  delete attributes.color;
  delete attributes.label;
  delete attributes.text;
  delete attributes.error;
  delete attributes.children;
  delete attributes.append;

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <FormGroup>
      {label ? (
        <Label for={inputId} className="form-control-label">
          {label}
        </Label>
      ) : null}
      <InputGroup>
        <ReactStrapInput
          id={inputId}
          className={classnames(
            "form-control-alternative",
            props.className,
            styleInput.input
          )}
          type={type}
          innerRef={ref}
          {...attributes}
        />
        {append}
      </InputGroup>
      {error ? (
        <FormFeedback style={{ display: "block" }}>{error}</FormFeedback>
      ) : text ? (
        <FormText>{text}</FormText>
      ) : null}
    </FormGroup>
  );
});
