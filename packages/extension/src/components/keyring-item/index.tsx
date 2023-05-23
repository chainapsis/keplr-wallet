import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { KeyRingV2, PlainObject } from "@keplr-wallet/background";
import { useStore } from "../../stores";
import { Box } from "../box";
import { Body2, Subtitle2 } from "../typography";
import { XAxis, YAxis } from "../axis";
import { ColorPalette } from "../../styles";
import { Gutter } from "../gutter";
import { Column, Columns } from "../column";
import { EllipsisIcon } from "../icon";
import { FloatingDropdown, FloatingDropdownItem } from "../dropdown";

export const KeyringItem: FunctionComponent<{
  keyInfo: KeyRingV2.KeyInfo;
  dropdownItems?: FloatingDropdownItem[];
  onClick?: () => void;
}> = observer(({ keyInfo, dropdownItems, onClick }) => {
  const { keyRingStore } = useStore();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const isSelected = keyRingStore.selectedKeyInfo?.id === keyInfo.id;

  const paragraph = (() => {
    if (keyInfo.insensitive["bip44Path"]) {
      const bip44Path = keyInfo.insensitive["bip44Path"] as any;
      if (
        bip44Path.account === 0 &&
        bip44Path.change === 0 &&
        bip44Path.addressIndex === 0
      ) {
        return;
      }

      // -1 means it can be multiple coin type.
      let coinType = -1;
      if (keyInfo.type === "ledger") {
        const isCosmos =
          keyInfo.insensitive["Cosmos"] != null ||
          keyInfo.insensitive["Terra"] != null;
        const isEthereum = keyInfo.insensitive["Ethereum"] != null;

        if (isCosmos && isEthereum) {
          coinType = -1;
        } else if (isCosmos) {
          coinType = 118;
        } else if (isEthereum) {
          coinType = 60;
        }
      }

      return `m/44'/${coinType >= 0 ? coinType : "-"}'/${bip44Path.account}'/${
        bip44Path.change
      }/${bip44Path.addressIndex}`;
    }
  })();

  const email = (() => {
    if (keyInfo.insensitive["keyRingMeta"]) {
      const googleEmail = (keyInfo.insensitive["keyRingMeta"] as PlainObject)[
        "google"
      ];

      return googleEmail;
    }
  })();

  return (
    <Box
      padding="1rem"
      minHeight="4.625rem"
      backgroundColor={ColorPalette["gray-600"]}
      borderColor={isSelected ? ColorPalette["gray-200"] : ""}
      borderWidth={isSelected ? "1px" : ""}
      borderRadius="0.375rem"
      alignY="center"
      cursor="pointer"
      hover={{
        backgroundColor: onClick ? ColorPalette["gray-550"] : undefined,
      }}
      onClick={onClick}
    >
      <Columns sum={1} alignY="center">
        <YAxis>
          <Subtitle2
            style={{
              color: ColorPalette["gray-10"],
            }}
          >
            {keyInfo.name}
          </Subtitle2>
          {paragraph ? (
            <React.Fragment>
              <Gutter size="0.375rem" />
              <Body2
                style={{
                  color: ColorPalette["gray-300"],
                }}
              >
                {paragraph}
              </Body2>
            </React.Fragment>
          ) : null}

          {email ? (
            <React.Fragment>
              <Gutter size="0.375rem" />
              <Body2
                style={{
                  color: ColorPalette["gray-300"],
                }}
              >
                {email}
              </Body2>
            </React.Fragment>
          ) : null}
        </YAxis>

        <Column weight={1} />
        <XAxis alignY="center">
          <Box
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {dropdownItems ? (
              <FloatingDropdown
                isOpen={isMenuOpen}
                close={() => setIsMenuOpen(false)}
                items={dropdownItems}
              >
                <Box
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  style={{ color: ColorPalette["gray-10"] }}
                >
                  <EllipsisIcon width="1.5rem" height="1.5rem" />
                </Box>
              </FloatingDropdown>
            ) : null}
          </Box>
        </XAxis>
      </Columns>
    </Box>
  );
});
