import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useStore } from "../../stores";
import { useNavigate } from "react-router";
import { useConfirm } from "../../hooks/confirm";
import { Box } from "../box";
import { Column, Columns } from "../column";
import { Stack } from "../stack";
import { Body2, H5 } from "../typography";
import { EllipsisIcon, ProfileIcon } from "../icon";
import { MemoIcon } from "../icon/memo";
import { FloatingDropdown } from "../dropdown";
import { ColorPalette } from "../../styles";
import { Bech32Address } from "@keplr-wallet/cosmos";
import styled from "styled-components";
import Color from "color";
import { useIntl } from "react-intl";
import { Gutter } from "../gutter";

const Styles = {
  AddressItemContainer: styled(Box)`
    background-color: ${ColorPalette["gray-600"]};
    &:hover {
      background-color: ${Color(ColorPalette["gray-550"]).string()};
    }
  `,
};

type HasDropDownOptionalType =
  | { hasDropDown: true; chainId: string; index: number }
  | { hasDropDown?: false; chainId?: string; index?: number };

export const AddressItem: FunctionComponent<
  {
    timestamp?: number;
    name?: string;
    address: string;
    memo?: string;
    onClick?: () => void;
  } & HasDropDownOptionalType
> = observer(
  ({
    timestamp,
    chainId,
    name,
    address,
    memo,
    index,
    hasDropDown = false,
    onClick,
  }) => {
    const intl = useIntl();

    const { uiConfigStore } = useStore();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const confirm = useConfirm();
    const canDropDown = hasDropDown && !!chainId && !!index;

    return (
      <Styles.AddressItemContainer
        padding="1rem"
        backgroundColor={ColorPalette["gray-600"]}
        borderRadius="0.375rem"
        cursor="pointer"
        onClick={(e) => {
          e.preventDefault();
          onClick && onClick();
        }}
      >
        <Columns sum={1} alignY="center">
          <Stack gutter="0.5rem">
            {timestamp ? (
              <React.Fragment>
                <H5
                  style={{
                    color: ColorPalette["gray-10"],
                  }}
                >
                  {`Sent on ${intl.formatDate(new Date(timestamp), {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })}`}
                </H5>
                <Gutter size="0.25rem" />
              </React.Fragment>
            ) : null}

            {name ? (
              <H5
                style={{
                  color: ColorPalette["gray-10"],
                }}
              >
                {name}
              </H5>
            ) : null}

            <Stack alignX="left" gutter="0.25rem">
              <Columns sum={1} gutter="0.375rem">
                <ProfileIcon width=".8rem" height=".8rem" />
                <Body2
                  style={{
                    color: ColorPalette["gray-200"],
                  }}
                >
                  {Bech32Address.shortenAddress(address, 30)}
                </Body2>
              </Columns>

              <Columns sum={1} gutter="0.375rem">
                <MemoIcon width=".8rem" height=".8rem" />
                {memo ? (
                  <Body2
                    style={{
                      color: ColorPalette["gray-200"],
                      width: "15rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {memo}
                  </Body2>
                ) : (
                  <Body2
                    style={{
                      color: ColorPalette["gray-200"],
                      width: "15rem",
                    }}
                  >
                    {"(Empty Memo)"}
                  </Body2>
                )}
              </Columns>
            </Stack>
          </Stack>

          <Column weight={1} />
          {canDropDown ? (
            <FloatingDropdown
              isOpen={isMenuOpen}
              close={() => setIsMenuOpen(false)}
              items={[
                {
                  key: "change-contact-label",
                  label: "Change Contact Label",
                  onSelect: () =>
                    navigate(
                      `/setting/contacts/add?chainId=${chainId}&editIndex=${index}`
                    ),
                },
                {
                  key: "delete-wallet",
                  label: "Delete Wallet",
                  onSelect: async () => {
                    if (
                      await confirm.confirm(
                        "Delete Address",
                        "Are you sure you want to delete this account?"
                      )
                    ) {
                      uiConfigStore.addressBookConfig.removeAddressBookAt(
                        chainId,
                        index
                      );
                    }
                  },
                },
              ]}
            >
              <Box
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ color: ColorPalette["gray-10"] }}
              >
                <EllipsisIcon width="1.25rem" height="1.25rem" />
              </Box>
            </FloatingDropdown>
          ) : null}
        </Columns>
      </Styles.AddressItemContainer>
    );
  }
);
