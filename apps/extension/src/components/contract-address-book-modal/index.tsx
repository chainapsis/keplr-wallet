import React, { FunctionComponent, useState } from "react";
import { Modal } from "../modal";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { Subtitle1, Subtitle3 } from "../typography";
import { Gutter } from "../gutter";
import { observer } from "mobx-react-lite";
import { useFocusOnMount } from "../../hooks/use-focus-on-mount";
import { SearchTextInput } from "../input";
import { ContractAddressItem } from "../contract-item";
import styled from "styled-components";
import SimpleBar from "simplebar-react";
import { EmptyView } from "../empty-view";
import { FormattedMessage, useIntl } from "react-intl";
import { useStore } from "../../stores";
import { TokenContractListRepoURL } from "../../config.ui";
import { TokenContract } from "../../stores/token-contracts";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1.25rem 0.75rem 0 0.75rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};

    overflow-y: auto;
  `,
  Link: styled.span`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-600"]
        : ColorPalette["gray-50"]};

    cursor: pointer;
    text-decoration: underline;
  `,
};

export const ContractAddressBookModal: FunctionComponent<{
  isOpen: boolean;

  chainId: string;
  onSelect: (tokenContract: TokenContract) => void;
  close: () => void;
}> = observer(({ isOpen, chainId, onSelect, close }) => {
  const { chainStore, queriesStore, starknetQueriesStore } = useStore();

  const contracts =
    "cosmos" in chainStore.getModularChain(chainId)
      ? queriesStore.get(chainId).tokenContracts.queryTokenContracts
          .tokenContracts
      : starknetQueriesStore.get(chainId).queryTokenContracts.tokenContracts;

  const [search, setSearch] = useState("");
  const searchRef = useFocusOnMount<HTMLInputElement>();
  const intl = useIntl();

  const filtered = search
    ? contracts.filter(
        (contract) =>
          contract.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
          contract.metadata.symbol.toLowerCase().includes(search.toLowerCase())
      )
    : contracts;

  return (
    <Modal isOpen={isOpen} close={close} align="bottom">
      <Styles.Container>
        <Subtitle1 style={{ textAlign: "center" }}>
          <FormattedMessage id="page.setting.token.add.contract-address-book-modal.title" />
        </Subtitle1>

        <Gutter size="0.75rem" />

        <SearchTextInput
          ref={searchRef}
          value={search}
          onChange={(e) => {
            e.preventDefault();

            setSearch(e.target.value);
          }}
          placeholder={intl.formatMessage({
            id: "page.setting.token.add.contract-address-book-modal.search-placeholder",
          })}
        />

        <Gutter size="0.75rem" />

        <SimpleBar
          style={{
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            height: "21.5rem",
          }}
        >
          {contracts.length === 0 ? (
            <React.Fragment>
              <Gutter size="7.5rem" direction="vertical" />
              <EmptyView>
                <Subtitle3>
                  <FormattedMessage id="page.setting.token.add.contract-address-book-modal.no-search-data" />
                </Subtitle3>
              </EmptyView>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {filtered.map((tokenContract, index) => (
                <ContractAddressItem
                  key={index}
                  tokenContract={tokenContract}
                  afterSelect={(tokenContract) => {
                    onSelect(tokenContract);
                  }}
                />
              ))}
            </React.Fragment>
          )}
        </SimpleBar>

        <Box alignX="center" alignY="center" padding="1rem">
          <Subtitle3 color={ColorPalette["gray-300"]}>
            <FormattedMessage
              id="page.setting.token.add.contract-address-book-modal.link"
              values={{
                link: (...chunks: any) => (
                  <Styles.Link
                    onClick={(e) => {
                      e.preventDefault();

                      browser.tabs.create({
                        url: TokenContractListRepoURL,
                      });
                    }}
                  >
                    {chunks}
                  </Styles.Link>
                ),
              }}
            />
          </Subtitle3>
        </Box>
      </Styles.Container>
    </Modal>
  );
});
