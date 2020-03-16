import React, { forwardRef, useState } from "react";

import classnames from "classnames";

import {
  FormFeedback,
  FormGroup,
  Input as ReactStrapInput,
  Label
} from "reactstrap";
import { InputType } from "reactstrap/lib/Input";

const Buffer = require("buffer/").Buffer;

export interface InputProps {
  type: Exclude<InputType, "textarea">;
  label?: string;
  feedback?: string;
  error?: string;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef<
  HTMLInputElement,
  InputProps & React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { type, label, feedback, error } = props;

  const attributes = { ...props };
  delete attributes.className;
  delete attributes.type;
  delete attributes.color;
  delete attributes.label;
  delete attributes.error;
  delete attributes.children;

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
      <ReactStrapInput
        id={inputId}
        className={classnames("form-control-alternative", props.className)}
        type={type}
        innerRef={ref}
        valid={error == null}
        invalid={error != null}
        {...attributes}
      />
      {error || feedback ? (
        <FormFeedback valid={error == null}>{error || feedback}</FormFeedback>
      ) : null}
    </FormGroup>
  );
});
