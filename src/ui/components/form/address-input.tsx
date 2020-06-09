import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { FormGroup, Label, Input, FormText, FormFeedback } from "reactstrap";
import { useTxState } from "../../popup/contexts/tx";
import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import {
  ENSUnsupportedError,
  InvalidENSNameError,
  isValidENS,
  useENS
} from "../../hooks/use-ens";

const ErrorIdBech32Address = "invalid-bech32-address";
const ErrorIdENSInvalidName = "ens-name-invalid";
const ErrorIdENSNotFound = "ens-name-not-found";
const ErrorIdENSUnsupported = "ens-unsupported";
const ErrorIdENSUnknownError = "ens-unknown-error";

export interface AddressInputProps {
  bech32Prefix: string;

  className?: string;
  label?: string;
  errorTexts: {
    invalidBech32Address: string;
    invalidENSName?: string;
    ensNameNotFound?: string;
    ensUnsupported?: string;
    ensUnknownError?: string;
  };

  // If coin type for ENS is delivered, this can fetch the address from ENS.
  // If this prop is not delivered, ens will not work.
  coinType?: number;
}

export const AddressInput: FunctionComponent<AddressInputProps> = ({
  bech32Prefix,
  className,
  label,
  errorTexts,
  coinType
}) => {
  const txState = useTxState();

  const [recipient, setRecipient] = useState<string>("");

  const ens = useENS(recipient, coinType, bech32Prefix);

  // Check that the recipient is valid.
  useEffect(() => {
    if (!isValidENS(recipient)) {
      if (recipient) {
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
      } else {
        txState.setError("recipient", ErrorIdBech32Address, null);
      }
    }
  }, [bech32Prefix, recipient, txState]);

  const clearENSError = useCallback(() => {
    txState.setError("recipient", ErrorIdENSInvalidName, null);
    txState.setError("recipient", ErrorIdENSNotFound, null);
    txState.setError("recipient", ErrorIdENSUnsupported, null);
    txState.setError("recipient", ErrorIdENSUnknownError, null);
  }, [txState]);

  // Check that the address from ENS is valid.
  useEffect(() => {
    if (isValidENS(recipient)) {
      if (ens.address) {
        const accAddress = new AccAddress(ens.address, bech32Prefix);
        if (txState.recipient?.toBech32() !== accAddress.toBech32()) {
          txState.setRecipient(accAddress);
          clearENSError();
          txState.setError("recipient", ErrorIdBech32Address, null);
        }
      } else if (!ens.loading && ens.error) {
        if (ens.error instanceof InvalidENSNameError) {
          txState.setError(
            "recipient",
            ErrorIdENSInvalidName,
            "ens name invalid"
          );
        } else if (ens.error.message.includes("ENS name not found")) {
          txState.setError(
            "recipient",
            ErrorIdENSNotFound,
            "ens name not found"
          );
        } else if (ens.error instanceof ENSUnsupportedError) {
          txState.setError(
            "recipient",
            ErrorIdENSUnsupported,
            "ens unsupported"
          );
        } else {
          txState.setError(
            "recipient",
            ErrorIdENSUnknownError,
            "ens unknown error"
          );
        }
      }
    } else {
      clearENSError();
    }
  }, [
    bech32Prefix,
    clearENSError,
    ens.address,
    ens.error,
    ens.loading,
    recipient,
    txState
  ]);

  const ensErrorText = (() => {
    if (txState.getError("recipient", ErrorIdENSInvalidName)) {
      return errorTexts.invalidENSName;
    } else if (txState.getError("recipient", ErrorIdENSNotFound)) {
      return errorTexts.ensNameNotFound;
    } else if (txState.getError("recipient", ErrorIdENSUnsupported)) {
      return errorTexts.ensUnsupported;
    } else if (txState.getError("recipient", ErrorIdENSUnknownError)) {
      return errorTexts.ensUnknownError;
    }
  })();

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
      {isValidENS(recipient) ? (
        ens.loading ? (
          <FormText>
            <i className="fas fa-spinner fa-spin" />
          </FormText>
        ) : ensErrorText ? (
          <FormFeedback style={{ display: "block" }}>
            {ensErrorText}
          </FormFeedback>
        ) : (
          <FormText>{ens.bech32Address}</FormText>
        )
      ) : txState.getError("recipient", ErrorIdBech32Address) ? (
        <FormFeedback style={{ display: "block" }}>
          {errorTexts.invalidBech32Address}
        </FormFeedback>
      ) : null}
    </FormGroup>
  );
};
