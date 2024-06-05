import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { KeyInfo } from "@keplr-wallet/background";
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
import { CheckIcon, EllipsisIcon } from "../../../components/icon";
import { Button } from "../../../components/button";
import styled, { useTheme } from "styled-components";
import { FloatingDropdown } from "../../../components/dropdown";
import { useIntl } from "react-intl";
import { App, AppCoinType } from "@keplr-wallet/ledger-cosmos";
import { SearchTextInput } from "../../../components/input";

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  AddButton: styled.div`
    position: absolute;
    top: 8.125rem;
    right: 0.75rem;
  `,
  Content: styled(Stack)`
    margin-top: 1.125rem;
  `,
};

export const WalletSelectPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const intl = useIntl();

  const [searchText, setSearchText] = useState<string>("");
  const [debounceSearchText, setDebounceSearchText] = useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearchText(searchText);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);

  const [searchedKeyInfos, setSearchedKeyInfos] = useState<
    KeyInfo[] | undefined
  >(undefined);
  useEffect(() => {
    if (debounceSearchText.trim().length === 0) {
      setSearchedKeyInfos(undefined);
      return;
    }

    let exposed = false;

    keyRingStore
      .searchKeyRings(debounceSearchText)
      .then((keyInfos) => {
        if (!exposed) {
          setSearchedKeyInfos(keyInfos);
        }
      })
      .catch(console.log);

    return () => {
      exposed = true;
    };
  }, [debounceSearchText, keyRingStore]);

  const keyInfos = searchedKeyInfos ?? keyRingStore.keyInfos;

  const mnemonicKeys = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      return keyInfo.type === "mnemonic";
    });
  }, [keyInfos]);

  const socialPrivateKeyInfos = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      if (
        keyInfo.type === "private-key" &&
        typeof keyInfo.insensitive === "object" &&
        keyInfo.insensitive["keyRingMeta"] &&
        typeof keyInfo.insensitive["keyRingMeta"] === "object" &&
        keyInfo.insensitive["keyRingMeta"]["web3Auth"] &&
        typeof keyInfo.insensitive["keyRingMeta"]["web3Auth"] === "object"
      ) {
        const web3Auth = keyInfo.insensitive["keyRingMeta"]["web3Auth"];
        if (web3Auth["type"] && web3Auth["email"]) {
          return true;
        }
      }

      return false;
    });
  }, [keyInfos]);

  const privateKeyInfos = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      return (
        keyInfo.type === "private-key" &&
        !socialPrivateKeyInfos.some((k) => k.id === keyInfo.id)
      );
    });
  }, [keyInfos, socialPrivateKeyInfos]);

  const ledgerKeys = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      return keyInfo.type === "ledger";
    });
  }, [keyInfos]);

  const keystoneKeys = useMemo(() => {
    return keyInfos.filter((keyInfo) => {
      return keyInfo.type === "keystone";
    });
  }, [keyInfos]);

  const unknownKeys = useMemo(() => {
    const knownKeys = mnemonicKeys
      .concat(ledgerKeys)
      .concat(privateKeyInfos)
      .concat(socialPrivateKeyInfos)
      .concat(keystoneKeys);
    return keyInfos.filter((keyInfo) => {
      return !knownKeys.find((k) => k.id === keyInfo.id);
    });
  }, [
    keyInfos,
    ledgerKeys,
    mnemonicKeys,
    privateKeyInfos,
    socialPrivateKeyInfos,
    keystoneKeys,
  ]);

  const socialPrivateKeyInfoByType: {
    type: string;
    keyInfos: KeyInfo[];
  }[] = useMemo(() => {
    const typeMap = new Map<string, KeyInfo[]>();

    socialPrivateKeyInfos.forEach((keyInfo) => {
      if (
        keyInfo.type === "private-key" &&
        typeof keyInfo.insensitive === "object" &&
        keyInfo.insensitive["keyRingMeta"] &&
        typeof keyInfo.insensitive["keyRingMeta"] === "object" &&
        keyInfo.insensitive["keyRingMeta"]["web3Auth"] &&
        typeof keyInfo.insensitive["keyRingMeta"]["web3Auth"] === "object"
      ) {
        const web3Auth = keyInfo.insensitive["keyRingMeta"]["web3Auth"];
        if (
          web3Auth["type"] &&
          web3Auth["email"] &&
          typeof web3Auth["type"] === "string" &&
          typeof web3Auth["email"] === "string"
        ) {
          const type = web3Auth["type"];

          const arr = typeMap.get(type) || [];
          arr.push(keyInfo);

          typeMap.set(type, arr);
        }
      }
    });

    const res: {
      type: string;
      keyInfos: KeyInfo[];
    }[] = [];

    for (const [type, keyInfos] of typeMap.entries()) {
      res.push({
        type,
        keyInfos,
      });
    }

    return res;
  }, [socialPrivateKeyInfos]);

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.wallet.title" })}
      left={<BackButton />}
    >
      <Styles.Container>
        <Box marginBottom="0.25rem">
          <SearchTextInput
            value={searchText}
            placeholder={intl.formatMessage({
              id: "page.wallet.input.search.placeholder",
            })}
            onChange={(e) => {
              e.preventDefault();

              setSearchText(e.target.value);
            }}
          />
        </Box>
        <Styles.AddButton>
          <Button
            text={intl.formatMessage({ id: "page.wallet.add-wallet-button" })}
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
            <KeyInfoList
              title={intl.formatMessage({
                id: "page.wallet.recovery-phrase-title",
              })}
              keyInfos={mnemonicKeys}
            />
          ) : null}

          {socialPrivateKeyInfoByType.map((info) => {
            return (
              <KeyInfoList
                key={info.type}
                title={intl.formatMessage(
                  { id: "page.wallet.connect-with-social-account-title" },
                  {
                    social:
                      info.type.length > 0
                        ? info.type[0].toUpperCase() + info.type.slice(1)
                        : info.type,
                  }
                )}
                keyInfos={info.keyInfos}
              />
            );
          })}

          {privateKeyInfos.length > 0 ? (
            <KeyInfoList
              title={intl.formatMessage({
                id: "page.wallet.private-key-title",
              })}
              keyInfos={privateKeyInfos}
            />
          ) : null}

          {ledgerKeys.length > 0 ? (
            <KeyInfoList
              title={intl.formatMessage({ id: "page.wallet.ledger-title" })}
              keyInfos={ledgerKeys}
            />
          ) : null}

          {keystoneKeys.length > 0 ? (
            <KeyInfoList title="Keystone" keyInfos={keystoneKeys} />
          ) : null}

          {unknownKeys.length > 0 ? (
            <KeyInfoList
              title={intl.formatMessage({ id: "page.wallet.unknown-title" })}
              keyInfos={unknownKeys}
            />
          ) : null}
        </Styles.Content>
      </Styles.Container>
    </HeaderLayout>
  );
});

const KeyInfoList: FunctionComponent<{
  title: string;
  keyInfos: KeyInfo[];
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
  keyInfo: KeyInfo;
}> = observer(({ keyInfo }) => {
  const { chainStore, keyRingStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const paragraph = useMemo(() => {
    if (keyInfo.insensitive["bip44Path"]) {
      const bip44Path = keyInfo.insensitive["bip44Path"] as any;

      // -1 means it can be multiple coin type.
      let coinType = -1;
      if (keyInfo.type === "ledger") {
        const ledgerAppCandidate: (App | "Ethereum")[] = [
          "Cosmos",
          "Terra",
          "Secret",
          "Ethereum",
        ];

        const app: (App | "Ethereum")[] = [];
        for (const ledgerApp of ledgerAppCandidate) {
          if (keyInfo.insensitive[ledgerApp] != null) {
            app.push(ledgerApp);
          }
        }

        if (app.length === 0 || app.length >= 2) {
          coinType = -1;
        } else if (app[0] === "Ethereum") {
          coinType = 60;
        } else {
          const c = AppCoinType[app[0]];
          if (c != null) {
            coinType = c;
          } else {
            coinType = -1;
          }
        }

        if (
          app.length === 1 &&
          app.includes("Cosmos") &&
          bip44Path.account === 0 &&
          bip44Path.change === 0 &&
          bip44Path.addressIndex === 0
        ) {
          return;
        }

        return `m/44'/${coinType >= 0 ? coinType : "-"}'/${
          bip44Path.account
        }'/${bip44Path.change}/${bip44Path.addressIndex}${(() => {
          if (app.length === 1) {
            if (app[0] !== "Cosmos" && app[0] !== "Ethereum") {
              return ` ${intl.formatMessage({
                id: `page.wallet.keyring-item.bip44-path-${app[0]}-text`,
              })}`;
            }
          }

          return "";
        })()}`;
      }

      if (
        bip44Path.account === 0 &&
        bip44Path.change === 0 &&
        bip44Path.addressIndex === 0
      ) {
        return;
      }

      return `m/44'/${coinType >= 0 ? coinType : "-"}'/${bip44Path.account}'/${
        bip44Path.change
      }/${bip44Path.addressIndex}`;
    }

    if (
      keyInfo.type === "private-key" &&
      typeof keyInfo.insensitive === "object" &&
      keyInfo.insensitive["keyRingMeta"] &&
      typeof keyInfo.insensitive["keyRingMeta"] === "object" &&
      keyInfo.insensitive["keyRingMeta"]["web3Auth"] &&
      typeof keyInfo.insensitive["keyRingMeta"]["web3Auth"] === "object"
    ) {
      const web3Auth = keyInfo.insensitive["keyRingMeta"]["web3Auth"];
      if (
        web3Auth["type"] &&
        web3Auth["email"] &&
        typeof web3Auth["type"] === "string" &&
        typeof web3Auth["email"] === "string"
      ) {
        return web3Auth["email"];
      }
    }
  }, [intl, keyInfo.insensitive, keyInfo.type]);

  const dropdownItems = (() => {
    const defaults = [
      {
        key: "change-wallet-name",
        label: intl.formatMessage({
          id: "page.wallet.keyring-item.dropdown.change-wallet-name-title",
        }),
        onSelect: () => navigate(`/wallet/change-name?id=${keyInfo.id}`),
      },
      {
        key: "delete-wallet",
        label: intl.formatMessage({
          id: "page.wallet.keyring-item.dropdown.delete-wallet-title",
        }),
        onSelect: () => navigate(`/wallet/delete?id=${keyInfo.id}`),
      },
    ];

    switch (keyInfo.type) {
      case "mnemonic": {
        defaults.unshift({
          key: "view-recovery-phrase",
          label: intl.formatMessage({
            id: "page.wallet.keyring-item.dropdown.view-recovery-path-title",
          }),
          onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
        });
        break;
      }
      case "private-key": {
        defaults.unshift({
          key: "view-recovery-phrase",
          label: intl.formatMessage({
            id: "page.wallet.keyring-item.dropdown.view-private-key-title",
          }),
          onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
        });
        break;
      }
    }

    return defaults;
  })();

  const isSelected = keyRingStore.selectedKeyInfo?.id === keyInfo.id;

  return (
    <Box
      padding="1rem"
      minHeight="4.625rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-600"]
      }
      borderRadius="0.375rem"
      alignY="center"
      cursor={!isSelected ? "pointer" : undefined}
      onClick={async () => {
        if (isSelected) {
          return;
        }

        await keyRingStore.selectKeyRing(keyInfo.id);
        await chainStore.waitSyncedEnabledChains();

        navigate(-1);
      }}
      style={{
        border: isSelected
          ? `1px solid ${ColorPalette["gray-200"]}`
          : undefined,
      }}
    >
      <Columns sum={1} alignY="center">
        <YAxis>
          <XAxis alignY="center">
            {isSelected ? (
              <React.Fragment>
                <CheckIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={ColorPalette["gray-200"]}
                />
                <Gutter size="0.25rem" />
              </React.Fragment>
            ) : null}
            <Subtitle2
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["gray-10"],
              }}
            >
              {keyInfo.name}
            </Subtitle2>
          </XAxis>
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
            cursor="pointer"
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
                <EllipsisIcon
                  width="1.5rem"
                  height="1.5rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-10"]
                  }
                />
              </Box>
            </FloatingDropdown>
          </Box>
        </XAxis>
      </Columns>
    </Box>
  );
});
