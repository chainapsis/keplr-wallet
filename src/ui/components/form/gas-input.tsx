import React, { FunctionComponent, useCallback, useState } from "react";
import { useTxState } from "../../popup/contexts/tx";
import { FormGroup, Input, Label } from "reactstrap";

export interface GasInputProps {
  label?: string;
  className?: string;
}

// TODO: Handle the max block gas limit(?)
export const GasInput: FunctionComponent<GasInputProps> = ({
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
        type="number"
        step={1}
        min={0}
        value={txState.gas}
        onChange={useCallback(
          e => {
            const gas = parseInt(e.target.value);
            if (!isNaN(gas)) {
              txState.setGas(gas);
            }
            e.preventDefault();
          },
          [txState]
        )}
        autoComplete="off"
      />
    </FormGroup>
  );
};
