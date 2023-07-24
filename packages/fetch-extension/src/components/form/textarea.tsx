import React, { forwardRef, useState } from "react";

import classnames from "classnames";

import {
  FormFeedback,
  FormGroup,
  Input as ReactStrapInput,
  Label,
} from "reactstrap";

import { Buffer } from "buffer/";

export interface TextareaProps {
  type?: string;

  label?: string;
  error?: string;
}

// eslint-disable-next-line react/display-name
export const TextArea = forwardRef<
  HTMLInputElement,
  TextareaProps & React.TextareaHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { type, label, error } = props;

  const attributes = { ...props };
  delete attributes.className;
  delete attributes.color;
  delete attributes.type;
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
        type={type ?? ("textarea" as any)}
        innerRef={ref}
        invalid={error != null}
        {...attributes}
      />
      {error ? <FormFeedback>{error}</FormFeedback> : null}
    </FormGroup>
  );
});
