import React, { FunctionComponent, useCallback, useState } from "react";
import { useTxState } from "../../popup/contexts/tx";
import { FormGroup, Input, Label } from "reactstrap";

export interface MemoInputProps {
  label?: string;
  className?: string;
}

// TODO: Handle the max memo bytes length for each chain.
export const MemoInput: FunctionComponent<MemoInputProps> = ({
  label,
  className
}) => {
  const txState = useTxState();

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <FormGroup className={className}>
      {label ? (
        <Label for={inputId} className="form-control-label">
          {label}
        </Label>
      ) : null}
      <Input
        id={inputId}
        className="form-control-alternative"
        type="textarea"
        rows={2}
        style={{ resize: "none" }}
        value={txState.memo}
        onChange={useCallback(
          e => {
            txState.setMemo(e.target.value);
            e.preventDefault();
          },
          [txState]
        )}
        autoComplete="off"
      />
    </FormGroup>
  );
};
