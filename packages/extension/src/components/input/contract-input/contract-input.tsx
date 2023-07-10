import React, { useState } from "react";
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
import { useTheme } from "styled-components";

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
    const theme = useTheme();
    const { chainStore, queriesStore } = useStore();
    const { chainId, isLoading, readOnly, error, setValue, register } = props;
    const [isAddressBookModalOpen, setIsAddressBookModalOpen] = useState(false);

    const queries = queriesStore.get(chainId);
    const tokenContractsQuery =
      queries.tokenContracts.queryTokenContracts.get(chainId);

    const contracts = tokenContractsQuery.getTokenContracts;

    return (
      <Box>
        <TextInput
          label="Contract Address"
          isLoading={isLoading}
          readOnly={readOnly}
          error={error}
          right={
            <IconButton
              onClick={() => {
                setIsAddressBookModalOpen(true);
              }}
              hoverColor={
                theme.mode === "light"
                  ? ColorPalette["gray-50"]
                  : ColorPalette["gray-500"]
              }
              padding="0.25rem"
            >
              <MenuIcon
                width="1.5rem"
                height="1.5rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-10"]
                }
              />
            </IconButton>
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

        <ContractAddressBookModal
          isOpen={isAddressBookModalOpen}
          onSelect={(address: string) => {
            setValue("contractAddress", address);
            setIsAddressBookModalOpen(false);
          }}
          close={() => setIsAddressBookModalOpen(false)}
          contracts={contracts}
        />
      </Box>
    );
  },
  {
    forwardRef: true,
  }
);
