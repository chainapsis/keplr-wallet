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
import { Button } from "../../../components/button";
import styled from "styled-components";
import { FloatingDropdown } from "../../../components/dropdown";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  AddButton: styled.div`
    position: absolute;
    top: 4.625rem;
    right: 0.75rem;
  `,
  Content: styled(Stack)`
    margin-top: 1.125rem;
  `,
};

export const WalletSelectPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const mnemonicKeys = useMemo(() => {
    return keyRingStore.keyInfos.filter((keyInfo) => {
      return keyInfo.type === "mnemonic";
    });
  }, [keyRingStore.keyInfos]);

  const privateKeyKeys = useMemo(() => {
    return keyRingStore.keyInfos.filter((keyInfo) => {
      return keyInfo.type === "private-key";
    });
  }, [keyRingStore.keyInfos]);

  const ledgerKeys = useMemo(() => {
    return keyRingStore.keyInfos.filter((keyInfo) => {
      return keyInfo.type === "ledger";
    });
  }, [keyRingStore.keyInfos]);

  const unknownKeys = useMemo(() => {
    const knownKeys = mnemonicKeys.concat(ledgerKeys).concat(privateKeyKeys);
    return keyRingStore.keyInfos.filter((keyInfo) => {
      return !knownKeys.find((k) => k.id === keyInfo.id);
    });
  }, [keyRingStore.keyInfos, ledgerKeys, mnemonicKeys, privateKeyKeys]);

  // TODO: Private key and web3 auth

  return (
    <HeaderLayout title="Select Wallet" left={<BackButton />}>
      <Styles.Container>
        <Styles.AddButton>
          <Button
            text="Add Wallet"
            size="extraSmall"
            color="secondary"
            onClick={async () => {
              await browser.tabs.create({
                url: "/register.html",
              });
            }}
          />
        </Styles.AddButton>

        <Styles.Content gutter="1.25rem">
          {mnemonicKeys.length > 0 ? (
            <KeyInfoList title="Recovery Phrase" keyInfos={mnemonicKeys} />
          ) : null}
          {privateKeyKeys.length > 0 ? (
            <KeyInfoList title="Private key" keyInfos={privateKeyKeys} />
          ) : null}
          {ledgerKeys.length > 0 ? (
            <KeyInfoList title="Ledger" keyInfos={ledgerKeys} />
          ) : null}

          {unknownKeys.length > 0 ? (
            <KeyInfoList title="Unknown" keyInfos={unknownKeys} />
          ) : null}
        </Styles.Content>
      </Styles.Container>
    </HeaderLayout>
  );
});

const KeyInfoList: FunctionComponent<{
  title: string;
  keyInfos: KeyRingV2.KeyInfo[];
}> = observer(({ title, keyInfos }) => {
  return (
    <Box>
      <YAxis>
        <Subtitle4
          color={ColorPalette["gray-300"]}
          style={{
            paddingLeft: "0.5rem",
          }}
        >
          {title}
        </Subtitle4>
        <Gutter size="0.5rem" />
        <Stack gutter="0.5rem">
          {keyInfos.map((keyInfo) => {
            return <KeyringItem key={keyInfo.id} keyInfo={keyInfo} />;
          })}
        </Stack>
      </YAxis>
    </Box>
  );
});

const KeyringItem: FunctionComponent<{
  keyInfo: KeyRingV2.KeyInfo;
}> = observer(({ keyInfo }) => {
  const { chainStore, keyRingStore } = useStore();

  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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

  const dropdownItems = (() => {
    const defaults = [
      {
        key: "change-wallet-name",
        label: "Change Wallet Name",
        onSelect: () => navigate(`/wallet/change-name?id=${keyInfo.id}`),
      },
      {
        key: "delete-wallet",
        label: "Delete Wallet",
        onSelect: () => navigate(`/wallet/delete?id=${keyInfo.id}`),
      },
    ];

    switch (keyInfo.type) {
      case "mnemonic": {
        defaults.unshift({
          key: "view-recovery-phrase",
          label: "View Recovery Phrase",
          onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
        });
        break;
      }
      case "private-key": {
        defaults.unshift({
          key: "view-recovery-phrase",
          label: "View Private key",
          onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
        });
        break;
      }
    }

    return defaults;
  })();

  return (
    <Box
      padding="1rem"
      minHeight="4.625rem"
      backgroundColor={ColorPalette["gray-600"]}
      borderRadius="0.375rem"
      alignY="center"
      cursor="pointer"
      onClick={async () => {
        await keyRingStore.selectKeyRing(keyInfo.id);
        await chainStore.waitSyncedEnabledChains();

        navigate(-1);
      }}
    >
      <Columns sum={1} alignY="center">
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
        </YAxis>
        <Column weight={1} />
        <XAxis alignY="center">
          <Box
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
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
          </Box>
        </XAxis>
      </Columns>
    </Box>
  );
});
