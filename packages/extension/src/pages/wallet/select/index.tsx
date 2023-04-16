import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { KeyRingV2 } from "@keplr-wallet/background";
import { useStore } from "../../../stores";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { Box } from "../../../components/box";
import { Body2, Subtitle2, Subtitle4 } from "../../../components/typography";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { Stack } from "../../../components/stack";
import { Column, Columns } from "../../../components/column";
import { useNavigate } from "react-router";
import { EllipsisIcon } from "../../../components/icon";
import { Menu, MenuItem } from "../../../components/menu";
import { Button } from "../../../components/button";

export const WalletSelectPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const mnemonicKeys = useMemo(() => {
    return keyRingStore.keyInfos.filter((keyInfo) => {
      return keyInfo.type === "mnemonic";
    });
  }, [keyRingStore.keyInfos]);

  const ledgerKeys = useMemo(() => {
    return keyRingStore.keyInfos.filter((keyInfo) => {
      return keyInfo.type === "private-key";
    });
  }, [keyRingStore.keyInfos]);

  const unknownKeys = useMemo(() => {
    const knownKeys = mnemonicKeys.concat(ledgerKeys);
    return keyRingStore.keyInfos.filter((keyInfo) => {
      return !knownKeys.find((k) => k.id === keyInfo.id);
    });
  }, [keyRingStore.keyInfos, ledgerKeys, mnemonicKeys]);

  // TODO: Private key and web3 auth

  return (
    <HeaderLayout title="Select Wallet" left={<BackButton />}>
      <YAxis alignX="right">
        <Button
          text="Add Wallet"
          size="small"
          color="secondary"
          onClick={async () => {
            await browser.tabs.create({
              url: "/register.html",
            });
          }}
        />
      </YAxis>
      <Box paddingX="0.75rem">
        {mnemonicKeys.length > 0 ? (
          <KeyInfoList title="Recovery Phrase" keyInfos={mnemonicKeys} />
        ) : null}
        {ledgerKeys.length > 0 ? (
          <KeyInfoList title="Ledger" keyInfos={ledgerKeys} />
        ) : null}

        {unknownKeys.length > 0 ? (
          <KeyInfoList title="Unknown" keyInfos={unknownKeys} />
        ) : null}
      </Box>
    </HeaderLayout>
  );
});

const KeyInfoList: FunctionComponent<{
  title: string;
  keyInfos: KeyRingV2.KeyInfo[];
}> = observer(({ title, keyInfos }) => {
  const { keyRingStore } = useStore();

  const navigate = useNavigate();

  return (
    <Box>
      <YAxis>
        <Subtitle4
          style={{
            color: ColorPalette["gray-300"],
          }}
        >
          {title}
        </Subtitle4>
        <Gutter size="0.5rem" />
        <Stack gutter="0.5rem">
          {keyInfos.map((keyInfo) => {
            return (
              <Box
                key={keyInfo.id}
                padding="1rem"
                backgroundColor={ColorPalette["gray-600"]}
                borderRadius="0.375rem"
                cursor="pointer"
                onClick={async () => {
                  await keyRingStore.selectKeyRing(keyInfo.id);

                  navigate(-1);
                }}
              >
                <Columns sum={1}>
                  <YAxis>
                    <Subtitle2
                      style={{
                        color: ColorPalette["gray-10"],
                      }}
                    >
                      {keyInfo.name}
                      {keyRingStore.selectedKeyInfo?.id === keyInfo.id
                        ? " (Selected)"
                        : ""}
                    </Subtitle2>
                    <Gutter size="0.375rem" />
                    <Body2
                      style={{
                        color: ColorPalette["gray-300"],
                      }}
                    >
                      TEST
                    </Body2>
                  </YAxis>
                  <Column weight={1} />
                  <XAxis alignY="center">
                    <Box
                      position="relative"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        console.log("!!!");
                      }}
                    >
                      <KeyringMenu vaultId={keyInfo.id} />
                    </Box>
                  </XAxis>
                </Columns>
              </Box>
            );
          })}
        </Stack>
      </YAxis>
    </Box>
  );
});

const KeyringMenu: FunctionComponent<{ vaultId: string }> = ({ vaultId }) => {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <Box>
      <Box
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ color: ColorPalette["gray-10"] }}
      >
        <EllipsisIcon width="1.25rem" height="1.25rem" />
      </Box>

      <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} ratio={1.7}>
        <MenuItem
          label="View Recovery Phrase"
          onClick={() => navigate(`/wallet/recovery-phrase?id=${vaultId}`)}
        />
        <MenuItem
          label="Change Wallet Name"
          onClick={() => navigate(`/wallet/change-name?id=${vaultId}`)}
        />
        <MenuItem
          label="Delete Wallet"
          onClick={() => navigate(`/wallet/delete?id=${vaultId}`)}
        />
      </Menu>
    </Box>
  );
};
