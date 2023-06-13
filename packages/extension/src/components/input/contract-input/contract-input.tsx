import React from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";

import { MenuIcon } from "../../icon";
import { Box } from "../../box";
import { IconButton } from "../../icon-button";
import { ColorPalette } from "../../../styles";
import { useStore } from "../../../stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ContractAddressBookModal } from "../../contract-address-book-modal";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";

export type ContractAddressInputProps = {
  chainId: string;
  isLoading: boolean;
  readOnly: boolean;
  error?: string;
  setValue: UseFormSetValue<FormData>;
  register: UseFormRegister<FormData>;
};

interface FormData {
  contractAddress: string;
  viewingKey: string;
}

export const ContractAddressInput = observer<
  ContractAddressInputProps,
  HTMLInputElement
>(
  (props) => {
    const { chainStore } = useStore();

    const { chainId, isLoading, readOnly, error, setValue, register } = props;

    const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
      React.useState(false);

    return (
      <Box>
        <TextInput
          label="Contract Address"
          isLoading={isLoading}
          readOnly={readOnly}
          error={error}
          right={
            chainId === "secret-4" ? (
              <IconButton
                onClick={() => {
                  setIsAddressBookModalOpen(true);
                }}
                hoverColor={ColorPalette["gray-500"]}
                padding="0.25ralem"
              >
                <MenuIcon width="1.5rem" height="1.5rem" />
              </IconButton>
            ) : null
          }
          {...register("contractAddress", {
            required: true,
            validate: (value): string | undefined => {
              try {
                const chainInfo = chainStore.getChain(chainId);
                Bech32Address.validate(
                  value,
                  chainInfo.bech32Config.bech32PrefixAccAddr
                );
              } catch (e) {
                return e.message || e.toString();
              }
            },
          })}
        />

        {chainId === "secret-4" ? (
          <ContractAddressBookModal
            isOpen={isAddressBookModalOpen}
            onSelect={(address: string) => {
              setValue("contractAddress", address);
              setIsAddressBookModalOpen(false);
            }}
          />
        ) : null}
      </Box>
    );
  },
  {
    forwardRef: true,
  }
);
