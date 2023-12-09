import React, { FunctionComponent } from "react";
import { Box } from "../box";
import { ColorPalette } from "../../styles";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Gutter } from "../gutter";
import { YAxis } from "../axis";
import { Caption1, Subtitle3 } from "../typography";
import { Column, Columns } from "../column";
import { RawImageFallback } from "../image";
import { TextButton } from "../button-text";
import { useTheme } from "styled-components";
import { useIntl } from "react-intl";

export const ContractAddressItem: FunctionComponent<{
  name: string;
  address: string;
  imageUrl: string | undefined;
  afterSelect: (address: string) => void;
}> = ({ name, address, imageUrl, afterSelect }) => {
  const theme = useTheme();
  const intl = useIntl();

  return (
    <Box
      paddingY="0.875rem"
      paddingLeft="1rem"
      paddingRight="0.5rem"
      borderRadius="0.375rem"
      hover={{
        backgroundColor:
          theme.mode === "light"
            ? ColorPalette["gray-10"]
            : ColorPalette["gray-550"],
      }}
      style={{
        cursor: "pointer",
      }}
      onClick={async (e) => {
        e.preventDefault();
        afterSelect(address);
      }}
    >
      <Columns sum={1} alignY="center" gutter="0.5rem">
        <Box>
          <RawImageFallback size="2rem" src={imageUrl} alt="chain icon" />
        </Box>
        <YAxis>
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-10"]
            }
          >
            {name}
          </Subtitle3>
          <Gutter size="0.25rem" />
          <Caption1 color={ColorPalette["gray-300"]}>
            {Bech32Address.shortenAddress(address, 20)}
          </Caption1>
        </YAxis>
        <Column weight={2} />
        <TextButton
          size="small"
          text={intl.formatMessage({
            id: "page.setting.token.add.contract-item.select-button",
          })}
        />
      </Columns>
    </Box>
  );
};
