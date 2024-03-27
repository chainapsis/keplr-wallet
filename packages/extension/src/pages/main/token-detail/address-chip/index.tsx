import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Body3 } from "../../../../components/typography";
import { useStore } from "../../../../stores";
import { XAxis } from "../../../../components/axis";
import { Bech32Address } from "@keplr-wallet/cosmos";

export const AddressChip: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { accountStore } = useStore();

  const account = accountStore.getAccount(chainId);

  const [isHover, setIsHover] = useState(false);

  return (
    <Box
      cursor="pointer"
      height="1.5rem"
      alignX="center"
      alignY="center"
      backgroundColor={
        !isHover ? ColorPalette["gray-600"] : ColorPalette["gray-550"]
      }
      borderRadius="99999px"
      paddingX="0.625rem"
      onClick={(e) => {
        e.preventDefault();

        // copy address
        navigator.clipboard.writeText(account.bech32Address);
      }}
      onHoverStateChange={setIsHover}
    >
      <XAxis alignY="center">
        <Body3 color={ColorPalette["gray-200"]}>
          {Bech32Address.shortenAddress(account.bech32Address, 18)}
        </Body3>
      </XAxis>
    </Box>
  );
});

export const QRCodeChip: FunctionComponent<{
  onClick: () => void;
}> = ({ onClick }) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <Box
      cursor="pointer"
      width="1.5rem"
      height="1.5rem"
      alignX="center"
      alignY="center"
      backgroundColor={
        !isHover ? ColorPalette["gray-600"] : ColorPalette["gray-550"]
      }
      borderRadius="99999px"
      onClick={onClick}
      onHoverStateChange={setIsHover}
    >
      <XAxis alignY="center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            fill={ColorPalette["gray-200"]}
            fillRule="evenodd"
            d="M2.833 1.668c-.644 0-1.167.522-1.167 1.167v2.333c0 .644.523 1.167 1.167 1.167h2.333c.645 0 1.167-.523 1.167-1.167V2.835c0-.645-.522-1.167-1.167-1.167H2.833zm-.167 1.167c0-.092.075-.167.167-.167h2.333c.093 0 .167.075.167.167v2.333a.167.167 0 01-.167.167H2.833a.167.167 0 01-.167-.167V2.835zm.167 4.833c-.644 0-1.167.522-1.167 1.167v2.333c0 .644.523 1.167 1.167 1.167h2.333c.645 0 1.167-.523 1.167-1.167V8.835c0-.645-.522-1.167-1.167-1.167H2.833zm-.167 1.167c0-.092.075-.167.167-.167h2.333c.093 0 .167.075.167.167v2.333a.167.167 0 01-.167.167H2.833a.167.167 0 01-.167-.167V8.835zm5-6c0-.645.523-1.167 1.167-1.167h2.333c.645 0 1.167.522 1.167 1.167v2.333c0 .644-.522 1.167-1.167 1.167H8.833a1.167 1.167 0 01-1.167-1.167V2.835zm1.167-.167a.167.167 0 00-.167.167v2.333c0 .092.075.167.167.167h2.333a.167.167 0 00.167-.167V2.835a.167.167 0 00-.167-.167H8.833zm-4.84.667A.667.667 0 003.327 4v.007c0 .368.298.667.666.667H4a.667.667 0 00.667-.667v-.007A.667.667 0 004 3.335h-.007zm6 0A.667.667 0 009.327 4v.007c0 .368.298.667.666.667H10a.667.667 0 00.667-.667v-.007A.667.667 0 0010 3.335h-.007zm-6 6a.667.667 0 00-.666.666v.007c0 .368.298.667.666.667H4a.667.667 0 00.667-.667v-.007A.667.667 0 004 9.335h-.007zm6 0a.667.667 0 00-.666.666v.007c0 .368.298.667.666.667H10a.667.667 0 00.667-.667v-.007A.667.667 0 0010 9.335h-.007zm-2.333-1c0-.369.298-.667.667-.667h.006c.369 0 .667.298.667.667v.006a.667.667 0 01-.667.667h-.006a.667.667 0 01-.667-.667v-.006zm4-.667a.667.667 0 00-.667.667v.006c0 .368.299.667.667.667h.007a.667.667 0 00.666-.667v-.006a.667.667 0 00-.666-.667h-.007zm-.667 4c0-.368.299-.667.667-.667h.007c.368 0 .666.299.666.667v.007a.667.667 0 01-.666.666h-.007a.667.667 0 01-.667-.666v-.007zm-2.666-.667a.667.667 0 00-.667.667v.007c0 .368.298.666.667.666h.006A.667.667 0 009 11.675v-.007a.667.667 0 00-.667-.667h-.006z"
            clipRule="evenodd"
          />
        </svg>
      </XAxis>
    </Box>
  );
};
