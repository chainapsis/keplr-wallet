import React, { FunctionComponent, useState } from "react";
import { Modal } from "../modal/v2";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import styled from "styled-components";
import { Body2, H5, Subtitle1 } from "../typography";
import { Gutter } from "../gutter";
import { HorizontalRadioGroup } from "../radio-group";
import { YAxis } from "../axis";
import { Stack } from "../stack";
import { Bech32Address } from "@keplr-wallet/cosmos";
import Color from "color";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
  `,
  ListContainer: styled.div`
    flex: 1;
    overflow-y: scroll;
  `,

  AddressItemContainer: styled(Box)`
    background-color: ${ColorPalette["gray-600"]};
    &:hover {
      background-color: ${Color(ColorPalette["gray-500"]).alpha(0.5).string()};
    }
  `,
};

type Type = "recent" | "contacts" | "accounts";

export const AddressBookModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = observer(({ isOpen, close }) => {
  const { uiConfigStore } = useStore();

  const [type, setType] = useState<Type>("recent");

  return (
    <Modal isOpen={isOpen} close={close} align="bottom">
      <Box
        maxHeight="30.625rem"
        minHeight="21.5rem"
        backgroundColor={ColorPalette["gray-600"]}
        paddingX="0.75rem"
        paddingTop="1rem"
      >
        <Box paddingX="0.5rem" paddingY="0.375rem">
          <Subtitle1
            style={{
              color: ColorPalette["white"],
            }}
          >
            Address List
          </Subtitle1>
        </Box>

        <Gutter size="0.75rem" />

        <YAxis alignX="left">
          <HorizontalRadioGroup
            items={[
              {
                key: "recent",
                text: "Recent",
              },
              {
                key: "contacts",
                text: "Contacts",
              },
              {
                key: "accounts",
                text: "My account",
              },
            ]}
            selectedKey={type}
            onSelect={(key) => {
              setType(key as Type);
            }}
          />
        </YAxis>

        <Gutter size="0.75rem" />

        <Styles.ListContainer>
          <Stack gutter="0.75rem">
            {(() => {
              switch (type) {
                case "contacts": {
                  return uiConfigStore.addressBookConfig
                    .getAddressBook("cosmoshub")
                    .map((addressData, i) => {
                      return (
                        <AddressItem
                          key={`contacts-${i}`}
                          name={addressData.name}
                          address={addressData.address}
                          memo={addressData.memo}
                        />
                      );
                    });
                }
                default: {
                  return null;
                }
              }
            })()}

            <Gutter size="0.75rem" />
          </Stack>
        </Styles.ListContainer>
      </Box>
    </Modal>
  );
});

const AddressItem: FunctionComponent<{
  name: string;
  address: string;
  memo?: string;
}> = ({ name, address, memo }) => {
  return (
    <Styles.AddressItemContainer
      paddingX="1rem"
      paddingY="0.75rem"
      borderRadius="0.375rem"
      cursor="pointer"
    >
      <H5
        style={{
          color: ColorPalette["gray-10"],
        }}
      >
        {name}
      </H5>
      <Gutter size="0.25rem" />

      <Body2
        style={{
          color: ColorPalette["gray-200"],
        }}
      >
        {Bech32Address.shortenAddress(address, 30)}
      </Body2>
      {memo ? <Gutter size="0.25rem" /> : null}

      {memo ? (
        <Body2
          style={{
            color: ColorPalette["gray-200"],
          }}
        >
          {memo}
        </Body2>
      ) : null}
    </Styles.AddressItemContainer>
  );
};
