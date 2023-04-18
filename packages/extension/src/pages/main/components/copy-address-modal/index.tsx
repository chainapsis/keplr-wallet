import React, { FunctionComponent, useState } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import {
  Subtitle1,
  Subtitle3,
  Caption1,
  Button2,
} from "../../../../components/typography";
import { TextInput } from "../../../../components/input";
import { Column, Columns } from "../../../../components/column";
import { SearchIcon, StarIcon } from "../../../../components/icon";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { ChainInfo } from "@keplr-wallet/types";
import { YAxis } from "../../../../components/axis";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainImageFallback } from "../../../../components/image";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem 0.75rem 0 0.75rem;

    background-color: ${ColorPalette["gray-600"]};

    overflow-y: scroll;
  `,
  ItemContainer: styled.div`
    padding: 0.875rem 0.5rem 0.875rem 1rem;
  `,
  TextButton: styled(Button2)`
    cursor: pointer;
    padding: 0.5rem 1rem;
  `,
};

export const CopyAddressModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const { chainStore, accountStore } = useStore();

  const [search, setSearch] = useState("");

  const addresses = chainStore.chainInfosInUI
    .map((chainInfo) => {
      const bech32Address = accountStore.getAccount(
        chainInfo.chainId
      ).bech32Address;
      return {
        chainInfo,
        bech32Address,
      };
    })
    .filter((address) => {
      if (address.bech32Address.length === 0) {
        return false;
      }

      const s = search.trim();
      if (s.length === 0) {
        return true;
      }

      if (address.chainInfo.chainId.includes(s)) {
        return true;
      }
      if (address.chainInfo.chainName.includes(s)) {
        return true;
      }
      if (address.bech32Address.includes(s)) {
        return true;
      }
    });

  return (
    <Styles.Container>
      <Subtitle1 style={{ color: ColorPalette["white"], textAlign: "center" }}>
        Copy Address
      </Subtitle1>

      <Gutter size="0.75rem" />
      <TextInput
        value={search}
        onChange={(e) => {
          e.preventDefault();

          setSearch(e.target.value);
        }}
        placeholder="Search for a chain"
        left={
          <SearchIcon
            width="1.25rem"
            height="1.25rem"
            color={ColorPalette["gray-300"]}
          />
        }
      />
      <Gutter size="0.75rem" />

      <Box
        height="20.5rem"
        style={{
          overflowY: "scroll",
        }}
      >
        {addresses.map((address) => {
          return (
            <ChainAddressItem
              key={address.chainInfo.chainId}
              chainInfo={address.chainInfo}
              bech32Address={address.bech32Address}
              close={close}
            />
          );
        })}
      </Box>
    </Styles.Container>
  );
});

export const ChainAddressItem: FunctionComponent<{
  chainInfo: ChainInfo;
  bech32Address: string;

  close: () => void;
}> = ({ chainInfo, bech32Address, close }) => {
  return (
    <Styles.ItemContainer>
      <Columns sum={1} alignY="center" gutter="0.5rem">
        <StarIcon width="1.25rem" height="1.25rem" />

        <Box>
          <ChainImageFallback
            style={{
              width: "2.25rem",
              height: "2.25rem",
            }}
            src={chainInfo.chainSymbolImageUrl}
            alt="chain icon"
          />
        </Box>
        <YAxis>
          <Subtitle3 color={ColorPalette["gray-10"]}>
            {chainInfo.chainName}
          </Subtitle3>
          <Gutter size="0.25rem" />
          <Caption1 color={ColorPalette["gray-300"]}>
            {Bech32Address.shortenAddress(bech32Address, 20)}
          </Caption1>
        </YAxis>
        <Column weight={1} />
        {/* TODO: Copy 버튼이 눌린 직후의 action을 어케할지 아직 안 정해짐 */}
        <Styles.TextButton
          onClick={async (e) => {
            e.preventDefault();

            await navigator.clipboard.writeText(bech32Address);

            close();
          }}
        >
          Copy
        </Styles.TextButton>
      </Columns>
    </Styles.ItemContainer>
  );
};
