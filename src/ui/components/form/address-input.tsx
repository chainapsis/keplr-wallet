import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { FormGroup, Label, Input } from "reactstrap";
import { useTxState } from "../../popup/contexts/tx";
import { AccAddress } from "@everett-protocol/cosmosjs/common/address";

const ErrorIdBech32Address = "invalid-bech32-address";

export interface AddressInputProps {
  bech32Prefix: string;

  className?: string;
  label?: string;
}

export const AddressInput: FunctionComponent<AddressInputProps> = ({
  bech32Prefix,
  className,
  label
}) => {
  const txState = useTxState();
  console.log(txState);

  const [recipient, setRecipient] = useState<string>("");

  // Check that the recipient is valid.
  useEffect(() => {
    try {
      const accAddress = AccAddress.fromBech32(recipient, bech32Prefix);
      if (txState.recipient?.toBech32() !== accAddress.toBech32()) {
        txState.setRecipient(accAddress);
        txState.setError("recipient", ErrorIdBech32Address, null);
      }
    } catch {
      txState.setRecipient(null);
      txState.setError(
        "recipient",
        ErrorIdBech32Address,
        "invalid bech32 address"
      );
    }
  }, [bech32Prefix, recipient, txState]);

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
        value={recipient}
        onChange={useCallback(e => {
          setRecipient(e.target.value);
          e.preventDefault();
        }, [])}
        autoComplete="off"
      />
    </FormGroup>
  );
};
