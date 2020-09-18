import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import {
  FormGroup,
  Label,
  Input,
  FormText,
  FormFeedback,
  ModalBody,
  Modal,
  InputGroup,
  Button
} from "reactstrap";
import { useTxState } from "../../contexts/tx";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import {
  ENSUnsupportedError,
  InvalidENSNameError,
  isValidENS,
  useENS
} from "../../hooks/use-ens";
import {
  AddressBookData,
  AddressBookPage
} from "../../popup/pages/setting/address-book";

import styleAddressInput from "./address-input.module.scss";
import classnames from "classnames";

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

  disableAddressBook?: boolean;
}

export const AddressInput: FunctionComponent<AddressInputProps> = ({
  bech32Prefix,
  className,
  label,
  errorTexts,
  coinType,
  disableAddressBook
}) => {
  const txState = useTxState();

  const ens = useENS(txState.rawAddress, coinType, bech32Prefix);

  // Check that the recipient is valid.
  useEffect(() => {
    if (!isValidENS(txState.rawAddress)) {
      if (txState.rawAddress) {
        try {
          const accAddress = AccAddress.fromBech32(
            txState.rawAddress,
            bech32Prefix
          );
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
  }, [bech32Prefix, txState.rawAddress, txState]);

  const clearENSError = useCallback(
    (ids: string[]) => {
      for (const id of ids) {
        txState.setError("recipient", id, null);
      }
    },
    [txState]
  );

  // Check that the address from ENS is valid.
  useEffect(() => {
    if (isValidENS(txState.rawAddress)) {
      if (ens.address) {
        const accAddress = new AccAddress(ens.address, bech32Prefix);
        if (txState.recipient?.toBech32() !== accAddress.toBech32()) {
          txState.setRecipient(accAddress);
          clearENSError([
            ErrorIdENSInvalidName,
            ErrorIdENSNotFound,
            ErrorIdENSUnsupported,
            ErrorIdENSUnknownError
          ]);
          txState.setError("recipient", ErrorIdBech32Address, null);
        }
      } else if (!ens.loading && ens.error) {
        txState.setRecipient(null);
        if (ens.error instanceof InvalidENSNameError) {
          txState.setError(
            "recipient",
            ErrorIdENSInvalidName,
            "ens name invalid"
          );
          clearENSError([
            ErrorIdENSNotFound,
            ErrorIdENSUnsupported,
            ErrorIdENSUnknownError
          ]);
        } else if (ens.error.message.includes("ENS name not found")) {
          txState.setError(
            "recipient",
            ErrorIdENSNotFound,
            "ens name not found"
          );
          clearENSError([
            ErrorIdENSInvalidName,
            ErrorIdENSUnsupported,
            ErrorIdENSUnknownError
          ]);
        } else if (ens.error instanceof ENSUnsupportedError) {
          txState.setError(
            "recipient",
            ErrorIdENSUnsupported,
            "ens unsupported"
          );
          clearENSError([
            ErrorIdENSInvalidName,
            ErrorIdENSNotFound,
            ErrorIdENSUnknownError
          ]);
        } else {
          txState.setError(
            "recipient",
            ErrorIdENSUnknownError,
            "ens unknown error"
          );
          clearENSError([
            ErrorIdENSInvalidName,
            ErrorIdENSNotFound,
            ErrorIdENSUnsupported
          ]);
        }
      } else {
        // If ens is loading, clear the recipient in tx state context.
        txState.setRecipient(null);
      }
    } else {
      clearENSError([
        ErrorIdENSInvalidName,
        ErrorIdENSNotFound,
        ErrorIdENSUnsupported,
        ErrorIdENSUnknownError
      ]);
    }
  }, [
    bech32Prefix,
    clearENSError,
    ens.address,
    ens.error,
    ens.loading,
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

  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);

  const openAddressBook = useCallback(() => {
    setIsAddressBookOpen(true);
  }, []);

  const closeAddressBook = useCallback(() => {
    setIsAddressBookOpen(false);
  }, []);

  const onSelectAddressBook = useCallback(
    (data: AddressBookData) => {
      closeAddressBook();
      txState.setRawAddress(data.address);
      txState.setMemo(data.memo);
    },
    [closeAddressBook, txState]
  );

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <React.Fragment>
      <Modal
        isOpen={isAddressBookOpen}
        backdrop={false}
        className={styleAddressInput.fullModal}
        wrapClassName={styleAddressInput.fullModal}
        contentClassName={styleAddressInput.fullModal}
      >
        <ModalBody className={styleAddressInput.fullModal}>
          <AddressBookPage
            onBackButton={closeAddressBook}
            onSelect={onSelectAddressBook}
            hideChainDropdown={true}
          />
        </ModalBody>
      </Modal>
      <FormGroup className={className}>
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}
        <InputGroup>
          <Input
            id={inputId}
            className={classnames(
              "form-control-alternative",
              styleAddressInput.input
            )}
            value={txState.rawAddress}
            onChange={useCallback(
              e => {
                txState.setRawAddress(e.target.value);
                e.preventDefault();
              },
              [txState]
            )}
            autoComplete="off"
          />
          {!disableAddressBook ? (
            <Button
              className={styleAddressInput.addressBookButton}
              color="primary"
              type="button"
              outline
              onClick={openAddressBook}
            >
              <i className="fas fa-address-book" />
            </Button>
          ) : null}
        </InputGroup>
        {isValidENS(txState.rawAddress) ? (
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
    </React.Fragment>
  );
};
