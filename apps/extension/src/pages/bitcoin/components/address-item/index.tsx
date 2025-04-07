import React, { FunctionComponent, useState } from "react";

import { Box } from "../../../../components/box";
import { Column, Columns } from "../../../../components/column";
import { BaseTypography, Body2, H5 } from "../../../../components/typography";
import { EllipsisIcon, ProfileIcon } from "../../../../components/icon";
import {
  FloatingDropdown,
  FloatingDropdownItem,
} from "../../../../components/dropdown";
import { ColorPalette } from "../../../../styles";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { FormattedMessage, useIntl } from "react-intl";
import { Gutter } from "../../../../components/gutter";
import { IconButton } from "../../../../components/icon-button";
import { XAxis, YAxis } from "../../../../components/axis";
import { useTheme } from "styled-components";

export const AddressItem: FunctionComponent<{
  timestamp?: number;
  name?: string;
  address: string;
  paymentType?: string;
  onClick?: () => void;

  dropdownItems?: FloatingDropdownItem[];
  // true면 border를 추가함.
  highlight?: boolean;
}> = ({
  timestamp,
  name,
  address,
  paymentType,
  onClick,
  dropdownItems,
  highlight,
}) => {
  const intl = useIntl();
  const theme = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <Box
      padding="1rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-50"]
          : ColorPalette["gray-600"]
      }
      hover={{
        backgroundColor: onClick
          ? theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-550"]
          : undefined,
      }}
      borderRadius="0.375rem"
      borderWidth={highlight ? "1px" : undefined}
      borderColor={highlight ? ColorPalette["gray-400"] : undefined}
      cursor={onClick ? "pointer" : undefined}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) {
          onClick();
        }
      }}
    >
      <Columns sum={1} alignY="center">
        <Column weight={1}>
          <YAxis>
            {timestamp ? (
              <React.Fragment>
                <H5
                  style={{
                    color:
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["gray-10"],
                  }}
                >
                  <FormattedMessage
                    id="components.address-item.sent-on-date"
                    values={{
                      date: intl.formatDate(new Date(timestamp), {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      }),
                    }}
                  />
                </H5>
                <Gutter size="0.5rem" />
              </React.Fragment>
            ) : null}

            <XAxis alignY="center">
              {name ? (
                <React.Fragment>
                  <H5
                    style={{
                      color:
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["gray-10"],
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {name}
                  </H5>
                  <Gutter size="0.25rem" />
                </React.Fragment>
              ) : null}
              {paymentType ? (
                <Box
                  alignX="center"
                  alignY="center"
                  backgroundColor={
                    theme.mode === "light"
                      ? ColorPalette["blue-50"]
                      : ColorPalette["gray-500"]
                  }
                  borderRadius="0.375rem"
                  paddingX="0.375rem"
                  paddingTop="0.125rem"
                  paddingBottom="0.1875rem"
                >
                  <BaseTypography
                    style={{
                      fontWeight: 400,
                      fontSize: "0.6875rem",
                    }}
                    color={
                      theme.mode === "light"
                        ? ColorPalette["blue-400"]
                        : ColorPalette["gray-200"]
                    }
                  >
                    {paymentType
                      .split("-")
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(" ")}
                  </BaseTypography>
                </Box>
              ) : null}
            </XAxis>

            <Gutter size="0.5rem" />

            <XAxis alignY="center">
              <ProfileIcon
                width="0.75rem"
                height="0.75rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
              />
              <Gutter size="0.25rem" />
              <Body2
                style={{
                  color:
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"],
                }}
              >
                {address.startsWith("0x")
                  ? `${address.slice(0, 15)}...${address.slice(-10)}`
                  : Bech32Address.shortenAddress(address, 30)}
              </Body2>
            </XAxis>

            <Gutter size="0.25rem" />
          </YAxis>
        </Column>

        {dropdownItems && dropdownItems.length > 0 ? (
          <FloatingDropdown
            isOpen={isMenuOpen}
            close={() => setIsMenuOpen(false)}
            items={dropdownItems}
          >
            <IconButton
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-10"]
              }
            >
              <EllipsisIcon width="1.5rem" height="1.5rem" />
            </IconButton>
          </FloatingDropdown>
        ) : null}
      </Columns>
    </Box>
  );
};
