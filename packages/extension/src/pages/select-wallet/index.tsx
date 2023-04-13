import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderLayout } from "../../layouts/header";
import { BackButton } from "../../layouts/header/components";
import { KeyRingV2 } from "@keplr-wallet/background";
import { Box } from "../../components/box";
import { XAxis, YAxis } from "../../components/axis";
import {
  Body2,
  Subtitle2,
  Subtitle3,
  Subtitle4,
} from "../../components/typography";
import { Gutter } from "../../components/gutter";
import { Stack } from "../../components/stack";
import { ColorPalette } from "../../styles";
import { useNavigate } from "react-router";
import { Column, Columns } from "../../components/column";

export const SelectWalletPage: FunctionComponent = observer(() => {
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
                      <MoreIcon size={20} color={ColorPalette["gray-10"]} />

                      {/* TODO: Apply alpha to background color */}
                      <Box
                        position="absolute"
                        borderRadius="0.5rem"
                        backgroundColor={ColorPalette["gray-400"]}
                        style={{
                          right: 0,
                          overflow: "hidden",
                          border: `1px solid ${ColorPalette["gray-300"]}`,
                        }}
                      >
                        <Box
                          height="2.5rem"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 1rem",
                          }}
                        >
                          <Subtitle3
                            style={{
                              color: ColorPalette["gray-10"],
                              whiteSpace: "nowrap",
                            }}
                          >
                            View Recovery Phrase
                          </Subtitle3>
                        </Box>
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: ColorPalette["gray-300"],
                          }}
                        />
                        <Box
                          height="2.5rem"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 1rem",
                          }}
                        >
                          <Subtitle3
                            style={{
                              color: ColorPalette["gray-10"],
                              whiteSpace: "nowrap",
                            }}
                          >
                            Change Wallet Name
                          </Subtitle3>
                        </Box>
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: ColorPalette["gray-300"],
                          }}
                        />
                        <Box
                          height="2.5rem"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 1rem",
                          }}
                        >
                          <Subtitle3
                            style={{
                              color: ColorPalette["gray-10"],
                              whiteSpace: "nowrap",
                            }}
                          >
                            Delete Wallet
                          </Subtitle3>
                        </Box>
                      </Box>
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

const MoreIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        fill={color}
        fillRule="evenodd"
        d="M8.75 5a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zm0 5a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zm0 5a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0z"
        clipRule="evenodd"
      />
    </svg>
  );
};
