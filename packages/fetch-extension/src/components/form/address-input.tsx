import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import {
  FormGroup,
  Label,
  Input,
  ModalBody,
  Modal,
  InputGroup,
  Button,
  FormText,
} from "reactstrap";
import { AddressBookPage } from "../../pages/setting/address-book";

import styleAddressInput from "./address-input.module.scss";
import classnames from "classnames";
import {
  InvalidBech32Error,
  EmptyAddressError,
  IRecipientConfig,
  IMemoConfig,
  ICNSFailedToFetchError,
  ICNSIsFetchingError,
  IIBCChannelConfig,
  InvalidHexError,
  IRecipientConfigWithICNS,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { validateAgentAddress } from "@utils/validate-agent";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "../../config.ui.var";
import { getBeneficiaryAddress } from "../../name-service/fns-apis";

export interface AddressInputProps {
  recipientConfig: IRecipientConfig | IRecipientConfigWithICNS;
  memoConfig?: IMemoConfig;
  ibcChannelConfig?: IIBCChannelConfig;

  className?: string;
  label?: string;

  disableAddressBook?: boolean;

  disabled?: boolean;
  value: string;
}

function numOfCharacter(str: string, c: string): number {
  return str.split(c).length - 1;
}

export const AddressInput: FunctionComponent<AddressInputProps> = observer(
  ({
    recipientConfig,
    memoConfig,
    ibcChannelConfig,
    className,
    label,
    disableAddressBook,
    disabled = false,
    value,
  }) => {
    const intl = useIntl();
    const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    useEffect(() => {
      if (value) {
        recipientConfig.setRawRecipient(value);
      }
    }, [recipientConfig, value]);
    const error = recipientConfig.error;
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAddressError:
            // No need to show the error to user.
            return;
          case InvalidBech32Error:
            return intl.formatMessage({
              id: "input.recipient.error.invalid-bech32",
            });
          case ICNSFailedToFetchError:
            return intl.formatMessage({
              id: "input.recipient.error.icns-failed-to-fetch",
            });
          case ICNSIsFetchingError:
            return;
          case InvalidHexError:
            return intl.formatMessage({
              id: "input.recipient.error.invalid-hex",
            });
          default:
            return intl.formatMessage({ id: "input.recipient.error.unknown" });
        }
      }
    }, [intl, error]);

    const isICNSName: boolean = (() => {
      if ("isICNSName" in recipientConfig) {
        return recipientConfig.isICNSName;
      }
      return false;
    })();

    const isICNSfetching: boolean = (() => {
      if ("isICNSFetching" in recipientConfig) {
        return recipientConfig.isICNSFetching;
      }
      return false;
    })();

    const selectAddressFromAddressBook = {
      setRecipient: (recipient: string) => {
        recipientConfig.setRawRecipient(recipient);
      },
      setMemo: (memo: string) => {
        if (memoConfig) {
          memoConfig.setMemo(memo);
        }
      },
    };
    const [isFNSFecthing, setIsFNSFecthing] = useState(false);
    const getFETOwner = async (
      chainId: string,
      domainName: string
    ): Promise<string | null | undefined> => {
      const getBeneficiaryAddressObject = await getBeneficiaryAddress(
        chainId,
        domainName
      );
      console.log(getBeneficiaryAddressObject);
      const getAddress = getBeneficiaryAddressObject
        ? getBeneficiaryAddressObject.address
        : null;
      console.log(getAddress);
      return getAddress;
    };

    const updateICNSvalue = (value: string) => {
      if (
        // If icns is possible and users enters ".", complete bech32 prefix automatically.
        "isICNSEnabled" in recipientConfig &&
        recipientConfig.isICNSEnabled &&
        value.length > 0 &&
        ![CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB].includes(
          recipientConfig.chainId
        ) &&
        value[value.length - 1] === "." &&
        numOfCharacter(value, ".") === 1 &&
        numOfCharacter(recipientConfig.rawRecipient, ".") === 0
      ) {
        value = value + recipientConfig.icnsExpectedBech32Prefix;
      }
      return value;
    };

    const updateFNSValue = async (value: string) => {
      if (
        [CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB].includes(
          recipientConfig.chainId
        ) &&
        value.length > 5 &&
        value.endsWith(".fet") &&
        numOfCharacter(value, ".") === 1
      ) {
        setIsFNSFecthing(true);

        recipientConfig.setRawRecipient(value);

        const FETOwner: any = await getFETOwner(recipientConfig.chainId, value);
        if (FETOwner) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          value = FETOwner;
        }
        setIsFNSFecthing(false);
      }
      return value;
    };

    return (
      <React.Fragment>
        <Modal
          isOpen={isAddressBookOpen}
          backdrop={false}
          className={styleAddressInput["fullModal"]}
          wrapClassName={styleAddressInput["fullModal"]}
          contentClassName={styleAddressInput["fullModal"]}
        >
          <ModalBody className={styleAddressInput["fullModal"]}>
            <AddressBookPage
              onBackButton={() => setIsAddressBookOpen(false)}
              hideChainDropdown={true}
              selectHandler={selectAddressFromAddressBook}
              ibcChannelConfig={ibcChannelConfig}
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
                styleAddressInput["input"]
              )}
              value={recipientConfig.rawRecipient}
              onChange={async (e) => {
                let value = e.target.value;

                // If ICNS is availabe and users enters ".", complete postfix automatically.
                value = updateICNSvalue(value);

                // If FET owner is availabe and users enters ".", complete postfix automatically.
                value = await updateFNSValue(value);

                recipientConfig.setRawRecipient(value);
                e.preventDefault();
              }}
              autoComplete="off"
              disabled={disabled}
            />
            {!disableAddressBook && memoConfig ? (
              <Button
                className={styleAddressInput["addressBookButton"]}
                color="primary"
                type="button"
                outline
                onClick={() => setIsAddressBookOpen(true)}
                disabled={disabled}
              >
                <i className="fas fa-address-book" />
              </Button>
            ) : null}
          </InputGroup>
          {isFNSFecthing ? (
            <div className={styleAddressInput["infoText"]}>
              <i className="fa fa-spinner fa-spin fa-fw" /> Fetching owner
              address
            </div>
          ) : null}
          {isICNSfetching ? (
            <FormText>
              <i className="fa fa-spinner fa-spin fa-fw" />
            </FormText>
          ) : null}
          {!isICNSfetching && isICNSName && !error ? (
            <FormText>{recipientConfig.recipient}</FormText>
          ) : null}
          {errorText != null &&
          !isFNSFecthing &&
          !recipientConfig.rawRecipient.startsWith("agent") ? (
            <div className={styleAddressInput["errorText"]}>{errorText}</div>
          ) : null}
          {recipientConfig.rawRecipient.startsWith("agent") &&
            validateAgentAddress(recipientConfig.rawRecipient) && (
              <div className={styleAddressInput["errorText"]}>
                Invalid agent address
              </div>
            )}
        </FormGroup>
      </React.Fragment>
    );
  }
);
