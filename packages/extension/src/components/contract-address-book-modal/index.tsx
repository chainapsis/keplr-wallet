import React, { FunctionComponent, useState } from "react";
import { Modal } from "../modal";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { Subtitle1 } from "../typography";
import { Gutter } from "../gutter";
import { YAxis } from "../axis";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useFocusOnMount } from "../../hooks/use-focus-on-mount";
import { SearchTextInput } from "../input";
import { ContractAddressItem } from "../contract-item";
import styled from "styled-components";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem 0.75rem 0 0.75rem;

    background-color: ${ColorPalette["gray-600"]};

    overflow-y: auto;
  `,
};

type Contract = {
  name: string;
  address: string;
  imageUrl: string;
};

export const ContractAddressBookModal: FunctionComponent<{
  isOpen: boolean;
  onSelect: (address: string) => void;
}> = observer(({ isOpen, onSelect }) => {
  const { chainStore } = useStore();

  const [search, setSearch] = useState("");
  const searchRef = useFocusOnMount<HTMLInputElement>();

  const contracts: Contract[] = [
    {
      address: "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
      name: "sSCRT",
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      imageUrl: chainStore.chainInfosInUI.find(
        (item) => item.chainName == "Secret Network"
      )!.chainSymbolImageUrl!,
    },

    {
      address: "secret19e75l25r6sa6nhdf4lggjmgpw0vmpfvsw5cnpe",
      name: "sATOM",
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      imageUrl: chainStore.chainInfosInUI.find(
        (item) => item.chainName === "Cosmos Hub"
      )!.chainSymbolImageUrl!,
    },
  ];

  return (
    <Modal isOpen={isOpen} close={close} align="bottom">
      <Styles.Container>
        <Subtitle1
          style={{ color: ColorPalette["white"], textAlign: "center" }}
        >
          Contract Addresses
        </Subtitle1>

        <Gutter size="0.75rem" />
        <SearchTextInput
          ref={searchRef}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
          placeholder="Search for a chain"
        />
        <Gutter size="0.75rem" />
        <Box
          height="21.5rem"
          style={{
            overflowY: "auto",
          }}
        >
          {contracts.map((contract) => {
            return (
              <YAxis key={contract.address}>
                <ContractAddressItem
                  name={contract.name}
                  address={contract.address}
                  imageUrl={contract.imageUrl}
                  afterSelect={(address) => {
                    onSelect(address);
                  }}
                />
              </YAxis>
            );
          })}
        </Box>
      </Styles.Container>
    </Modal>
  );
});
