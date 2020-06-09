import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { useTxState } from "../../popup/contexts/tx";
import { FormGroup, Input, Label } from "reactstrap";

export interface MemoInputProps {
  label?: string;
  className?: string;
}

// TODO: Handle the max memo bytes length for each chain.
export const MemeInput: FunctionComponent<MemoInputProps> = ({
  label,
  className
}) => {
  const txState = useTxState();

  const [memo, setMemo] = useState<string>("");

  // Set memo
  useEffect(() => {
    txState.setMemo(memo);
  }, [memo, txState]);

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
        value={memo}
        onChange={useCallback(e => {
          setMemo(e.target.value);
          e.preventDefault();
        }, [])}
        autoComplete="off"
      />
    </FormGroup>
  );
};
