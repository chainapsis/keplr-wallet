/* eslint-disable import/no-extraneous-dependencies */
import { validateDestinationAddressByChainSymbol } from "@axelar-network/axelarjs-sdk";
import { Input } from "@components/form/input";
import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { Card } from "@components-v2/card";
import { Dropdown } from "@components-v2/dropdown";
import { ChainList } from "@layouts-v2/header/chain-list";

interface RecipientAddressProps {
  recieverChain: any;
  recipientAddress: any;
  setRecipientAddress: any;
  isDisabled: boolean;
  env: any;
}

export const RecipientAddress: React.FC<RecipientAddressProps> = ({
  recieverChain,
  recipientAddress,
  setRecipientAddress,
  isDisabled,
  env,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addressValidationInProgress, setAddressValidationInProgress] =
    useState<boolean>(false);
  const [addressValidationError, setAddressValidationError] =
    useState<string>("");
  useEffect(() => {
    validateRecipient(recipientAddress);
  }, [recieverChain, recipientAddress]);

  const validateRecipient = async (address: string) => {
    setAddressValidationInProgress(true);
    if (address.trim() === "") {
      setAddressValidationError("");
    } else {
      const validation = await validateDestinationAddressByChainSymbol(
        recieverChain?.chainSymbol || "",
        address,
        env
      );
      !validation
        ? setAddressValidationError("Invalid hex address value")
        : setAddressValidationError("");
    }
    setAddressValidationInProgress(false);
  };

  return (
    <div>
      <Card heading={"Transfer To"} onClick={() => setIsOpen(true)} />
      <Dropdown
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Transfer To"
        closeClicked={() => setIsOpen(false)}
        styleProp={{ height: "576px" }}
      >
        <ChainList showAddress={true} />{" "}
      </Dropdown>
      <Input
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setRecipientAddress(e.target.value)
        }
        placeholder={!recieverChain ? "Select To chain first" : "Transfer to"}
        value={recipientAddress}
        disabled={isDisabled}
      />
      {!addressValidationInProgress && addressValidationError ? (
        <div className={style["errorText"]}>{addressValidationError}</div>
      ) : null}
    </div>
  );
};
