import React, { FunctionComponent, useState } from "react";
import { Modal } from "../modal";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { Subtitle1 } from "../typography";
import { Gutter } from "../gutter";
import { YAxis } from "../axis";
import { observer } from "mobx-react-lite";
import { useFocusOnMount } from "../../hooks/use-focus-on-mount";
import { SearchTextInput } from "../input";
import { ContractAddressItem } from "../contract-item";
import styled from "styled-components";
import { TokenContractInfo } from "@keplr-wallet/stores";

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

export const ContractAddressBookModal: FunctionComponent<{
  isOpen: boolean;
  contracts: TokenContractInfo[];
  onSelect: (address: string) => void;
}> = observer(({ isOpen, onSelect, contracts }) => {
  const [search, setSearch] = useState("");
  const searchRef = useFocusOnMount<HTMLInputElement>();

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
              <YAxis key={contract.contractAddress}>
                <ContractAddressItem
                  name={contract.name}
                  address={contract.contractAddress}
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
