import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { Box } from "../../components/box";
import { MainHeaderLayout } from "../main/layouts/header";
import {
  Body2,
  Body3,
  Subtitle3,
  Subtitle4,
} from "../../components/typography";
import { ColorPalette } from "../../styles";
import { SettingList } from "./components/setting-list";
import { useStore } from "../../stores";
import { useLanguage } from "../../languages";
import { useAppTheme } from "../../theme";
import { Toggle } from "../../components/toggle";
import { isRunningInSidePanel, toggleSidePanelMode } from "../../utils";
import {
  GetSidePanelEnabledMsg,
  GetSidePanelIsSupportedMsg,
  SetDisableAnalyticsMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { SearchTextInput } from "../../components/input";
import { HelpDeskUrl } from "../../config.ui";
import { useFocusOnMount } from "../../hooks/use-focus-on-mount";
import { Gutter } from "../../components/gutter";
import { XAxis, YAxis } from "../../components/axis";
import { PricePretty } from "@keplr-wallet/unit";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Image } from "../../components/image";
import { Tooltip } from "../../components/tooltip";
import { useTheme } from "styled-components";
import { version } from "../../../package.json";
import { useIntl } from "react-intl";

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const theme = useTheme();
  const intl = useIntl();

  const { keyRingStore, uiConfigStore } = useStore();

  const [disableAnalytics, setDisableAnalytics] = React.useState<boolean>(
    localStorage.getItem("disable-analytics") === "true"
  );

  const [sidePanelSupported, setSidePanelSupported] = useState(false);
  const [sidePanelEnabled, setSidePanelEnabled] = useState(
    isRunningInSidePanel()
  );
  useEffect(() => {
    const msg = new GetSidePanelIsSupportedMsg();
    new InExtensionMessageRequester()
      .sendMessage(BACKGROUND_PORT, msg)
      .then((res) => {
        setSidePanelSupported(res.supported);

        const msg = new GetSidePanelEnabledMsg();
        new InExtensionMessageRequester()
          .sendMessage(BACKGROUND_PORT, msg)
          .then((res) => {
            setSidePanelEnabled(res.enabled);
          });
      });
  }, []);

  const [searchText, setSearchText] = useState<string>("");

  const focusOnMount = useFocusOnMount<HTMLInputElement>();

  const topSectionItems: {
    key: string;
    title: string;
    icon?: React.ComponentType;
    searches?: string[];
    onClick?: () => void;
  }[] = [
    {
      key: "contacts",
      icon: IconContacts,
      title: intl.formatMessage({
        id: "page.setting.general.contacts-title",
      }),
      onClick: () => navigate("/setting/contacts/list"),
    },
    {
      key: "link-keplr-mobile",
      icon: IconLinkKeplrMobile,
      title: intl.formatMessage({
        id: "page.setting.general.link-kpelr-mobile-title",
      }),
      onClick: () => navigate("/setting/general/link-keplr-mobile"),
    },
  ];

  const hasSearchText = searchText.trim().length > 0;

  return (
    <MainHeaderLayout>
      <Box paddingTop="1rem">
        <Box paddingX="1rem">
          <SearchTextInput
            ref={focusOnMount}
            placeholder={intl.formatMessage({
              id: "page.setting.search-placeholder",
            })}
            borderRadius="0.75rem"
            value={searchText}
            alternativeSearchIcon={AlternativeSearchIcon}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Box>
        {hasSearchText ? (
          <Gutter size="1rem" />
        ) : (
          <TopSection items={topSectionItems} />
        )}
        <SettingList
          search={searchText}
          sections={[
            ...(() => {
              if (hasSearchText) {
                // search text가 있을때는 top section이 보이지 않기 때문에
                // top section의 항목이 검색이 될 수 있도록 여기에 item을 추가해준다.
                return [
                  {
                    key: "top",
                    title: "Top",
                    items: topSectionItems.map((item) => {
                      if (item.onClick) {
                        return {
                          ...item,
                          right: ClickableRightIcon,
                          rightProps: {},
                        };
                      } else {
                        return {
                          ...item,
                        };
                      }
                    }),
                  },
                ];
              }

              return [];
            })(),
            {
              key: "chains-and-assets",
              title: intl.formatMessage({
                id: "page.setting.list.chains-and-assets",
              }),
              items: [
                {
                  key: "add-remove-chains",
                  icon: IconAddRemoveChains,
                  title: intl.formatMessage({
                    id: "page.setting.general.manage-chain-visibility-title",
                  }),
                  right: ClickableRightIcon,
                  rightProps: {},
                  onClick: () => {
                    if (keyRingStore.selectedKeyInfo) {
                      browser.tabs
                        .create({
                          url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
                        })
                        .then(() => {
                          window.close();
                        });
                    }
                  },
                },
                {
                  key: "delete-custom-chains",
                  icon: IconDeleteCustomChains,
                  title: intl.formatMessage({
                    id: "page.setting.advanced.manage-non-native-chains-title",
                  }),
                  right: ClickableRightIcon,
                  rightProps: {},
                  onClick: () =>
                    navigate("/setting/advanced/delete-suggest-chain"),
                },
                {
                  key: "add-remove-custom-token",
                  icon: IconAddRemoveCustomTokens,
                  title: intl.formatMessage({
                    id: "page.setting.manage-token-list-title",
                  }),
                  searches: ["contract", "erc20", "cw20", "secret20"],
                  right: ClickableRightIcon,
                  rightProps: {},
                  onClick: () => navigate("/setting/token/list"),
                },
              ],
            },
            {
              key: "general",
              title: intl.formatMessage({
                id: "page.setting.list.general",
              }),
              items: [
                {
                  key: "language",
                  icon: IconLanguage,
                  title: intl.formatMessage({
                    id: "page.setting.general.language-title",
                  }),
                  right: LanguageRight,
                  rightProps: {},
                  onClick: () => navigate("/setting/general/language"),
                },
                {
                  key: "currency",
                  icon: IconCurrency,
                  title: intl.formatMessage({
                    id: "page.setting.general.currency-title",
                  }),
                  right: CurrencyRight,
                  rightProps: {},
                  onClick: () => navigate("/setting/general/fiat"),
                },
                {
                  key: "theme",
                  icon: IconTheme,
                  title: intl.formatMessage({
                    id: "page.setting.general.theme-title",
                  }),
                  right: ThemeRight,
                  rightProps: {},
                  onClick: () => navigate("/setting/general/theme"),
                },
                ...(() => {
                  if (sidePanelSupported) {
                    return [
                      {
                        key: "side-panel",
                        icon: IconSidePanel,
                        title: intl.formatMessage({
                          id: "page.setting.general.side-panel-title",
                        }),
                        right: Toggle,
                        rightProps: {
                          size: "smaller",
                          isOpen: sidePanelEnabled,
                          setIsOpen: () => {
                            toggleSidePanelMode(!sidePanelEnabled, (res) => {
                              setSidePanelEnabled(res);

                              if (res) {
                                uiConfigStore.setShowNewSidePanelHeaderTop(
                                  false
                                );
                              }
                            });
                          },
                        },
                      },
                    ];
                  }
                  return [];
                })(),
                {
                  key: "show-24h-price-change",
                  icon: Icon24HPrice,
                  title: intl.formatMessage({
                    id: "page.setting.general.show-24h-price-changes-title",
                  }),
                  right: Toggle,
                  rightProps: {
                    size: "smaller",
                    isOpen: uiConfigStore.show24HChangesInMagePage,
                    setIsOpen: () => {
                      uiConfigStore.toggleShow24HChangesInMagePage();
                    },
                  },
                },
                {
                  key: "advanced",
                  icon: IconAdvanced,
                  title: intl.formatMessage({
                    id: "page.setting.advanced-title",
                  }),
                  subtitles: [
                    intl.formatMessage({
                      id: "page.setting.advanced.endpoints",
                    }),
                    "Authz",
                    intl.formatMessage({
                      id: "page.setting.advanced.developer-mode-title",
                    }),
                  ],
                  onClick: () => navigate("/setting/advanced"),
                },
              ],
            },
            {
              key: "security-privacy",
              title: intl.formatMessage({
                id: "page.setting.list.security-privacy",
              }),
              items: [
                {
                  key: "change-password",
                  icon: IconChangePassword,
                  title: intl.formatMessage({
                    id: "page.setting.security.change-password-title",
                  }),
                  right: ClickableRightIcon,
                  rightProps: {},
                  onClick: () => navigate("/setting/security/change-password"),
                },
                {
                  key: "connected-websites",
                  icon: IconConnectedWebsites,
                  title: intl.formatMessage({
                    id: "page.setting.security.connected-websites-title",
                  }),
                  searches: ["permission"],
                  right: ConnectedWebsitesRight,
                  rightProps: {},
                  onClick: () => navigate("/setting/security/permission"),
                },
                {
                  key: "share-anonymous-data",
                  icon: IconAdvanced,
                  title: intl.formatMessage({
                    id: "page.setting.security.analytics-title",
                  }),
                  right: Toggle,
                  rightProps: {
                    size: "smaller",
                    isOpen: !disableAnalytics,
                    setIsOpen: () => {
                      const disableAnalytics =
                        localStorage.getItem("disable-analytics") === "true";

                      new InExtensionMessageRequester()
                        .sendMessage(
                          BACKGROUND_PORT,
                          new SetDisableAnalyticsMsg(!disableAnalytics)
                        )
                        .then((analyticsDisabled) => {
                          localStorage.setItem(
                            "disable-analytics",
                            analyticsDisabled ? "true" : "false"
                          );

                          setDisableAnalytics(analyticsDisabled);
                        });
                    },
                  },
                },
              ],
            },
            {
              key: "more",
              title: intl.formatMessage({
                id: "page.setting.list.more",
              }),
              items: [
                {
                  key: "helpdesk",
                  icon: IconHelpDesk,
                  title: intl.formatMessage({
                    id: "page.setting.helpdesk.title",
                  }),
                  right: ClickableRightIcon,
                  rightProps: {},
                  onClick: () => {
                    browser.tabs.create({
                      url: HelpDeskUrl,
                    });
                  },
                },
                {
                  key: "about-keplr",
                  icon: IconAboutKeplr,
                  title: intl.formatMessage({
                    id: "page.setting.about.title",
                  }),
                  subtitles: [
                    intl.formatMessage({
                      id: "page.setting.about.website",
                    }),
                    intl.formatMessage({
                      id: "page.setting.about.terms-of-use",
                    }),
                    intl.formatMessage({
                      id: "page.setting.about.privacy-policy",
                    }),
                  ],
                  onClick: () => navigate("/setting/about"),
                },
              ],
            },
          ]}
        />
        {hasSearchText ? null : (
          <Box paddingX="1rem" paddingY="0.75rem" marginTop="1rem">
            <XAxis alignY="center">
              <Subtitle4 color={ColorPalette["gray-300"]}>
                Extension Version
              </Subtitle4>
              <div style={{ flex: 1 }} />
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-100"]
                }
              >
                {version}
              </Body3>
            </XAxis>
          </Box>
        )}
      </Box>
    </MainHeaderLayout>
  );
});

const TopSection: FunctionComponent<{
  items: {
    key: string;
    title: string;
    icon?: React.ComponentType;
    onClick?: () => void;
  }[];
}> = observer(({ items }) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    keyRingStore,
    uiConfigStore,
    hugeQueriesStore,
  } = useStore();

  const navigate = useNavigate();
  const theme = useTheme();

  const icnsPrimaryName = (() => {
    if (
      uiConfigStore.icnsInfo &&
      chainStore.hasChain(uiConfigStore.icnsInfo.chainId)
    ) {
      const queries = queriesStore.get(uiConfigStore.icnsInfo.chainId);
      const icnsQuery = queries.icns.queryICNSNames.getQueryContract(
        uiConfigStore.icnsInfo.resolverContractAddress,
        accountStore.getAccount(uiConfigStore.icnsInfo.chainId).bech32Address
      );

      return icnsQuery.primaryName.split(".")[0];
    }
  })();

  const disabledViewAssetTokenMap =
    uiConfigStore.manageViewAssetTokenConfig.getViewAssetTokenMapByVaultId(
      keyRingStore.selectedKeyInfo?.id ?? ""
    );

  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      const disabledCoinSet = disabledViewAssetTokenMap.get(
        ChainIdHelper.parse(bal.chainInfo.chainId).identifier
      );

      if (
        bal.price &&
        !disabledCoinSet?.has(bal.token.currency.coinMinimalDenom)
      ) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances, disabledViewAssetTokenMap]);

  const stakedTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.delegations) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    for (const bal of hugeQueriesStore.unbondings) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.delegations, hugeQueriesStore.unbondings]);

  const totalPriceText = useMemo(() => {
    if (!availableTotalPrice && !stakedTotalPrice) {
      return "-";
    }
    if (availableTotalPrice && !stakedTotalPrice) {
      return availableTotalPrice.toString();
    }
    if (!availableTotalPrice && stakedTotalPrice) {
      return stakedTotalPrice.toString();
    }
    if (availableTotalPrice && stakedTotalPrice) {
      return availableTotalPrice.add(stakedTotalPrice).toString();
    }
    return "-";
  }, [availableTotalPrice, stakedTotalPrice]);

  const [isAccountHovered, setIsAccountHovered] = useState(false);

  return (
    <React.Fragment>
      <Gutter size="1rem" />
      <Box paddingX="1rem">
        <Box
          paddingX="1rem"
          paddingY="0.75rem"
          borderRadius="0.75rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-650"]
          }
          hover={{
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["gray-10"]
                : ColorPalette["gray-550"],
          }}
          cursor="pointer"
          onHoverStateChange={setIsAccountHovered}
          onClick={(e) => {
            e.preventDefault();

            navigate("/wallet/select");
          }}
          color={
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-300"]
          }
          transitions={["box-shadow 0.25s ease-out"]}
          style={{
            boxShadow:
              theme.mode === "light"
                ? isAccountHovered
                  ? "0px 25px 40px -15px #D8DCED"
                  : undefined
                : undefined,
          }}
        >
          <XAxis alignY="center">
            {icnsPrimaryName ? (
              <React.Fragment>
                <Tooltip
                  content={
                    <div style={{ whiteSpace: "nowrap" }}>
                      ICNS : {icnsPrimaryName}
                    </div>
                  }
                >
                  <Image
                    alt="icns-icon"
                    src={require(theme.mode === "light"
                      ? "../../public/assets/img/icns-icon-light.png"
                      : "../../public/assets/img/icns-icon.png")}
                    style={{ width: "1rem", height: "1rem" }}
                  />
                </Tooltip>
                <Gutter size="0.75rem" />
              </React.Fragment>
            ) : null}
            <YAxis>
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["gray-10"]
                }
              >
                {keyRingStore.selectedKeyInfo?.name || "Keplr Account"}
              </Subtitle3>
              <Gutter size="0.38rem" />
              <Body3 color={ColorPalette["gray-300"]}>{totalPriceText}</Body3>
            </YAxis>
            <div style={{ flex: 1 }} />
            <ClickableRightIcon />
          </XAxis>
        </Box>
        <Gutter size="0.75rem" />
        <XAxis>
          {items.map((item, i) => {
            return (
              <React.Fragment key={item.key}>
                <TopSectionXAxisItem item={item} />
                {i !== items.length - 1 ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "1px",
                        height: "1rem",
                        backgroundColor: ColorPalette["gray-500"],
                      }}
                    />
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </XAxis>
      </Box>
      <Gutter size="1rem" />
    </React.Fragment>
  );
});

const TopSectionXAxisItem: FunctionComponent<{
  item: {
    key: string;
    title: string;
    icon?: React.ComponentType;
    onClick?: () => void;
  };
}> = ({ item }) => {
  const theme = useTheme();

  const [isHover, setIsHover] = useState(false);

  return (
    <Box
      paddingX="1rem"
      paddingY="0.38rem"
      color={
        theme.mode === "light"
          ? ColorPalette["gray-200"]
          : ColorPalette["gray-300"]
      }
      cursor={item.onClick ? "pointer" : undefined}
      onHoverStateChange={setIsHover}
      opacity={isHover ? 0.5 : 1}
      onClick={(e) => {
        e.preventDefault();

        item.onClick?.();
      }}
    >
      <XAxis alignY="center">
        {item.icon ? <item.icon /> : null}
        <Gutter size="0.38rem" />
        <Subtitle3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette["gray-10"]
          }
        >
          {item.title}
        </Subtitle3>
      </XAxis>
    </Box>
  );
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ClickableRightIcon: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m5.5 3 5 5-5 5"
      />
    </svg>
  );
};

const LanguageRight: FunctionComponent = () => {
  const language = useLanguage();

  return (
    <Body2 color={ColorPalette["gray-300"]}>{language.languageFullName}</Body2>
  );
};

const CurrencyRight: FunctionComponent = observer(() => {
  const { uiConfigStore } = useStore();

  return (
    <Body2 color={ColorPalette["gray-300"]}>
      {`${
        uiConfigStore.fiatCurrency.symbol
      } (${uiConfigStore.fiatCurrency.currency.toUpperCase()})`}
    </Body2>
  );
});

const ThemeRight: FunctionComponent = () => {
  const theme = useAppTheme();
  const intl = useIntl();

  return (
    // TODO: intl
    <Body2 color={ColorPalette["gray-300"]}>
      {capitalizeFirstLetter(
        intl.formatMessage({
          id: `page.setting.general.theme.short.${theme.option}`,
        })
      )}
    </Body2>
  );
};

const ConnectedWebsitesRight: FunctionComponent = observer(() => {
  const { permissionManagerStore } = useStore();

  const num = useMemo(() => {
    let n = 0;
    for (const [_, value] of Object.entries(
      permissionManagerStore.permissionData
    )) {
      if (value?.permissions) {
        n = n + value.permissions.length;
      }
      if (value?.globalPermissions) {
        n = n + value.globalPermissions.length;
      }
    }

    return n;
  }, [permissionManagerStore.permissionData]);

  return <Body2 color={ColorPalette["gray-300"]}>{num}</Body2>;
});

const IconContacts = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="29"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M16.28 7.948q.417-.024.833.038l.249.046a4.05 4.05 0 0 1 3.188 4.262 4.05 4.05 0 0 1-.637 1.896 4 4 0 0 1-.818.919c2.298.86 3.906 2.568 3.906 4.986a.7.7 0 0 1-.699.698h-2.811a.699.699 0 0 1 0-1.397h2.043c-.353-1.794-1.967-3.016-4.249-3.304a.7.7 0 0 1-.612-.693v-.167l.01-.117a.7.7 0 0 1 .509-.558q.306-.082.587-.234l.143-.084a2.66 2.66 0 0 0 1.234-2.05 2.654 2.654 0 0 0-2.088-2.791l-.163-.03a2.7 2.7 0 0 0-.727-.01l-.141.004a.699.699 0 0 1-.033-1.39z"
      />
      <path
        fill="currentColor"
        d="M11.482 8.116a3.877 3.877 0 0 1 3.877 3.877 3.87 3.87 0 0 1-1.656 3.174c2.403.775 4.172 2.668 4.173 5.102 0 .29-.235.524-.524.524H5.618a.524.524 0 0 1-.524-.524c0-2.433 1.765-4.326 4.167-5.1a3.877 3.877 0 0 1 2.221-7.052"
      />
    </svg>
  );
};

const AlternativeSearchIcon: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25rem"
      height="1.25rem"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        fill="currentColor"
        d="m17.84 16.46-3.676-3.675A6.8 6.8 0 0 0 15.525 8.7 6.833 6.833 0 0 0 8.7 1.875 6.833 6.833 0 0 0 1.875 8.7 6.833 6.833 0 0 0 8.7 15.525a6.8 6.8 0 0 0 4.085-1.36l3.675 3.675a.977.977 0 0 0 1.38-1.38M3.825 8.7a4.875 4.875 0 1 1 9.75 0 4.875 4.875 0 0 1-9.75 0"
      />
    </svg>
  );
};

const IconLinkKeplrMobile = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="29"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M21.401 18.189h-3.2v-5.6h3.2m.8-1.6h-4.8a.8.8 0 0 0-.8.8v8a.8.8 0 0 0 .8.8h4.8a.8.8 0 0 0 .8-.8v-8a.8.8 0 0 0-.8-.8m-14-1.6h12.4a.8.8 0 0 0 0-1.6h-12.4a1.6 1.6 0 0 0-1.6 1.6v8.8h-.4a1.2 1.2 0 0 0 0 2.4H15v-2.4H8.2z"
      />
    </svg>
  );
};

const IconAddRemoveChains = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M15.368 11.429c.456 0 .825.37.825.825v1.526h1.443a.825.825 0 0 1 0 1.65h-1.442v1.528a.826.826 0 0 1-1.65 0v-1.527h-1.612a.825.825 0 0 1 0-1.65h1.611v-1.527c0-.456.37-.825.825-.825"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M18.073 8.023a2.2 2.2 0 0 1 1.76 1.095l2.531 4.387.07.129a2.2 2.2 0 0 1 0 1.941l-.07.13-2.532 4.386a2.2 2.2 0 0 1-1.759 1.095l-.146.005h-5.064a2.2 2.2 0 0 1-1.829-.975l-.077-.125-2.533-4.386a2.2 2.2 0 0 1 0-2.2l2.533-4.387a2.2 2.2 0 0 1 1.906-1.1h5.064zm-5.21 1.696a.5.5 0 0 0-.434.25l-2.532 4.386a.5.5 0 0 0-.03.44l.03.06 2.532 4.386c.09.155.255.25.434.25h5.064a.5.5 0 0 0 .433-.25l2.533-4.386a.5.5 0 0 0 0-.5L18.36 9.968l-.037-.056a.5.5 0 0 0-.396-.194z"
        clipRule="evenodd"
      />
      <path
        fill="currentColor"
        d="M6.933 9.172a.85.85 0 0 1 1.5.8L6.3 13.97a1.35 1.35 0 0 0-.07 1.118l.07.152 2.133 3.997a.85.85 0 0 1-1.5.801L4.8 16.04l-.084-.17a3.05 3.05 0 0 1 .084-2.7z"
      />
    </svg>
  );
};

const IconDeleteCustomChains = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M15.846 13.755a.85.85 0 1 1 0 1.7h-4.704a.85.85 0 1 1 0-1.7z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16.284 8.022a2.2 2.2 0 0 1 1.759 1.095l2.532 4.387.07.129a2.2 2.2 0 0 1 0 1.941l-.07.13-2.532 4.386a2.2 2.2 0 0 1-1.76 1.096l-.146.004h-5.064a2.2 2.2 0 0 1-1.828-.975l-.077-.125-2.534-4.386a2.2 2.2 0 0 1 0-2.2l2.534-4.387c.393-.68 1.12-1.1 1.905-1.1h5.064zm-5.211 1.795a.4.4 0 0 0-.347.2l-2.532 4.386a.4.4 0 0 0-.041.303l.041.098 2.532 4.386a.4.4 0 0 0 .347.2h5.064a.4.4 0 0 0 .347-.2l2.532-4.386a.4.4 0 0 0 0-.4l-2.532-4.386-.065-.084a.4.4 0 0 0-.282-.117z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const IconAddRemoveCustomTokens: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M15.743 10.925c.455 0 .825.37.825.825v1.42h1.43a.826.826 0 0 1 0 1.651h-1.43v1.429a.826.826 0 0 1-1.65 0v-1.429h-1.42a.825.825 0 0 1 0-1.65h1.42V11.75c0-.456.37-.825.825-.825"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M15.748 7.15a6.85 6.85 0 1 1 0 13.701 6.85 6.85 0 0 1 0-13.7m0 1.7a5.151 5.151 0 1 0 .001 10.302 5.151 5.151 0 0 0-.001-10.302"
        clipRule="evenodd"
      />
      <path
        fill="currentColor"
        d="M7.296 8.771a.851.851 0 0 1 1.406.958c-1.747 2.567-1.802 5.69-.164 8.293l.164.25.045.074a.851.851 0 0 1-1.399.952l-.052-.07-.2-.304c-1.994-3.172-1.928-7.025.2-10.153"
      />
    </svg>
  );
};

const IconLanguage: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14.607 17.333h4.783m-4.783 0L13.332 20m1.275-2.667 1.91-3.994c.155-.322.231-.482.337-.533a.33.33 0 0 1 .29 0c.105.05.182.212.336.533l1.91 3.994m0 0L20.665 20M7.332 9.333h4m0 0h2.333m-2.333 0V8m2.333 1.333h1.667m-1.667 0c-.33 1.972-1.098 3.758-2.223 5.257m1.223.743a6.3 6.3 0 0 1-1.223-.743m0 0c-.901-.691-1.708-1.639-2.11-2.59m2.11 2.59A11.5 11.5 0 0 1 7.332 18"
      />
    </svg>
  );
};

const IconCurrency: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M14.001 5.666a8.333 8.333 0 1 1-8.333 8.333 8.333 8.333 0 0 1 8.333-8.333m0 1.667a6.667 6.667 0 1 0 0 13.333 6.667 6.667 0 0 0 0-13.333m0 1.666a.833.833 0 0 1 .828.736l.006.098v.833H16.5a.834.834 0 0 1 .098 1.66l-.098.007h-4.166a.417.417 0 0 0-.075.826l.075.007h3.333a2.083 2.083 0 0 1 .137 4.162l-.137.005h-.833v.833a.833.833 0 0 1-1.661.098l-.006-.098v-.833h-1.667a.834.834 0 0 1-.097-1.661l.097-.006h4.167a.417.417 0 0 0 .075-.827l-.075-.006h-3.333a2.083 2.083 0 0 1-.137-4.163l.137-.004h.833v-.833a.834.834 0 0 1 .833-.834"
      />
    </svg>
  );
};

const IconTheme: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M14 21a6.8 6.8 0 0 1-2.73-.551 7.1 7.1 0 0 1-2.222-1.497A7.1 7.1 0 0 1 7.55 16.73 6.8 6.8 0 0 1 7 14q0-1.452.551-2.73a7.1 7.1 0 0 1 1.496-2.222A7.1 7.1 0 0 1 11.27 7.55 6.8 6.8 0 0 1 14 7q1.452 0 2.73.551a7.1 7.1 0 0 1 2.223 1.496q.945.945 1.496 2.223.55 1.278.551 2.73 0 1.452-.551 2.73a7.1 7.1 0 0 1-1.497 2.223 7.1 7.1 0 0 1-2.222 1.496A6.8 6.8 0 0 1 14 21m.7-1.453q2.082-.262 3.491-1.828T19.6 14t-1.409-3.719T14.7 8.453z"
      />
    </svg>
  );
};

const IconSidePanel: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M13.067 13.456 11.16 11.55q-.194-.195-.428-.097-.233.097-.233.37v4.355q0 .271.233.37.233.096.428-.098l1.906-1.906A.75.75 0 0 0 13.3 14a.75.75 0 0 0-.233-.544M7 8.556q0-.642.457-1.099A1.5 1.5 0 0 1 8.556 7h10.888q.642 0 1.099.457T21 8.556v10.888q0 .642-.457 1.1a1.5 1.5 0 0 1-1.099.456H8.556a1.5 1.5 0 0 1-1.1-.457A1.5 1.5 0 0 1 7 19.444zm8.556 0h-7v10.888h7z"
      />
    </svg>
  );
};

const Icon24HPrice: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M10.667 13.791v-3.542q0-.52.364-.885t.886-.365q.52 0 .885.365.365.364.365.885v3.542q0 .52-.365.885a1.2 1.2 0 0 1-.885.365q-.522 0-.886-.365a1.2 1.2 0 0 1-.364-.885m4.166-.187V6.916q0-.52.365-.885.364-.365.885-.365.522 0 .886.365.364.364.364.885v6.688q0 .625-.385.937a1.34 1.34 0 0 1-.865.313q-.48 0-.864-.313-.386-.312-.386-.937M6.5 16.479v-2.896q0-.522.365-.886t.885-.364q.52 0 .885.364.365.365.365.886v2.896q0 .625-.385.937a1.34 1.34 0 0 1-.865.313q-.48 0-.865-.313-.385-.312-.385-.937m2 5.062q-.542 0-.76-.51-.219-.51.177-.907l3.416-3.416a.83.83 0 0 1 .552-.25.75.75 0 0 1 .573.208l2.375 2.042L19.5 14.04H19a.8.8 0 0 1-.594-.24.8.8 0 0 1-.24-.593q0-.354.24-.594t.594-.24h2.5q.354 0 .594.24t.24.594v2.5q0 .354-.24.593a.8.8 0 0 1-.594.24.8.8 0 0 1-.594-.24.8.8 0 0 1-.24-.593v-.5l-5.208 5.208a.83.83 0 0 1-.552.25.75.75 0 0 1-.573-.208l-2.375-2.042-2.875 2.875a.9.9 0 0 1-.26.177.76.76 0 0 1-.323.073"
      />
    </svg>
  );
};

const IconAdvanced: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="m12.856 19.216 4.434-5.312h-3.427l.62-4.863-3.962 5.72h2.977zm-1.328-2.742H8.872q-.515 0-.76-.46a.79.79 0 0 1 .053-.89l6.405-9.21q.213-.3.556-.418t.707.01a.93.93 0 0 1 .536.45q.171.322.128.686l-.685 5.548h3.32q.557 0 .782.493.225.492-.14.92l-7.047 8.44q-.236.28-.578.365a.97.97 0 0 1-.664-.065 1.12 1.12 0 0 1-.503-.46 1.06 1.06 0 0 1-.14-.675z"
      />
    </svg>
  );
};

const IconChangePassword: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M8.977 14.5q-.824 0-1.4-.576a1.9 1.9 0 0 1-.577-1.4q0-.825.577-1.401a1.9 1.9 0 0 1 1.4-.577q.825 0 1.4.577.577.575.577 1.4t-.576 1.4a1.9 1.9 0 0 1-1.4.577m-.659 3.955a.64.64 0 0 1-.47-.19.64.64 0 0 1-.189-.47q0-.278.19-.468a.64.64 0 0 1 .47-.19h11.863q.28 0 .47.19t.189.469a.64.64 0 0 1-.19.47.63.63 0 0 1-.47.189zM14.25 14.5q-.825 0-1.4-.576a1.9 1.9 0 0 1-.577-1.4q0-.825.576-1.401a1.9 1.9 0 0 1 1.401-.577q.825 0 1.4.577.577.575.577 1.4t-.576 1.4a1.9 1.9 0 0 1-1.401.577m5.273 0q-.825 0-1.4-.576a1.9 1.9 0 0 1-.578-1.4q0-.825.577-1.401a1.9 1.9 0 0 1 1.4-.577q.825 0 1.401.577.577.575.577 1.4t-.577 1.4a1.9 1.9 0 0 1-1.4.577"
      />
    </svg>
  );
};

const IconConnectedWebsites: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path fill="currentColor" d="M19 16a3 3 0 1 1 0 6 3 3 0 0 1 0-6" />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M14.385 6.26A7.75 7.75 0 0 1 21.75 14l-.01.385a8 8 0 0 1-.033.412A4.97 4.97 0 0 0 19 14c-.978 0-1.89.28-2.66.766l.002-.016h-4.684c.077 1.544.386 2.903.827 3.895.256.576.542.996.82 1.261.276.262.51.344.695.344a.7.7 0 0 0 .152-.019 5 5 0 0 0 .645 1.476q-.396.042-.797.043l-.385-.01A7.75 7.75 0 0 1 6.25 14l.01-.385A7.75 7.75 0 0 1 14 6.25zm-6.588 8.49a6.25 6.25 0 0 0 3.5 4.884 8 8 0 0 1-.183-.38c-.537-1.21-.881-2.783-.959-4.504zm3.5-6.385a6.25 6.25 0 0 0-3.5 4.885h2.358c.078-1.722.422-3.294.96-4.504q.087-.195.183-.38M14 7.75c-.186 0-.42.082-.694.344-.28.265-.565.685-.82 1.26-.442.993-.751 2.352-.828 3.896h4.684c-.077-1.544-.386-2.903-.827-3.896-.256-.575-.542-.995-.82-1.26-.276-.262-.51-.344-.695-.344m2.886.996c.537 1.21.881 2.782.959 4.504h2.358a6.25 6.25 0 0 0-3.502-4.885q.097.185.185.381"
        clipRule="evenodd"
      />
    </svg>
  );
};

const IconHelpDesk: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M13.96 19q.437 0 .74-.302.3-.302.301-.74 0-.436-.302-.739a1 1 0 0 0-.74-.302q-.437 0-.739.302a1 1 0 0 0-.302.74q0 .437.302.74.302.3.74.301M14 22.334a8.1 8.1 0 0 1-3.25-.657 8.4 8.4 0 0 1-2.646-1.78 8.4 8.4 0 0 1-1.78-2.647A8.1 8.1 0 0 1 5.667 14q0-1.729.656-3.25a8.4 8.4 0 0 1 1.781-2.646 8.4 8.4 0 0 1 2.646-1.78 8.1 8.1 0 0 1 3.25-.657q1.73 0 3.25.656a8.4 8.4 0 0 1 2.646 1.781 8.4 8.4 0 0 1 1.781 2.646 8.1 8.1 0 0 1 .657 3.25 8.1 8.1 0 0 1-.657 3.25 8.4 8.4 0 0 1-1.78 2.646 8.4 8.4 0 0 1-2.647 1.781 8.1 8.1 0 0 1-3.25.657m0-1.667q2.792 0 4.73-1.937 1.937-1.938 1.937-4.73 0-2.79-1.937-4.729Q16.793 7.334 14 7.334q-2.79 0-4.729 1.937-1.937 1.938-1.937 4.73 0 2.79 1.937 4.729 1.938 1.937 4.73 1.937m.084-10.25q.52 0 .906.333.385.334.385.834 0 .458-.28.812a5 5 0 0 1-.636.667q-.48.417-.844.916a1.86 1.86 0 0 0-.365 1.126q0 .29.22.49a.74.74 0 0 0 .51.197q.312 0 .53-.208a.96.96 0 0 0 .282-.521q.083-.438.375-.781t.625-.657q.48-.458.823-1 .345-.541.344-1.208 0-1.062-.865-1.74Q15.231 9 14.085 9q-.793 0-1.51.334a2.33 2.33 0 0 0-1.094 1.02.75.75 0 0 0-.094.532q.051.281.281.427a.83.83 0 0 0 1.125-.25q.23-.313.573-.48.345-.165.719-.166"
      />
    </svg>
  );
};

const IconAboutKeplr: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      fill="none"
      stroke="none"
      viewBox="0 0 28 28"
    >
      <path
        fill="currentColor"
        d="M12.398 9.295v3.978l3.65-3.978H18.3v.054l-4.269 4.503 4.625 4.744v.108H16.42l-4.021-4.167v4.167h-1.812v-9.41z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M19.12 5.005A4.09 4.09 0 0 1 23 9.09v9.818l-.005.21a4.09 4.09 0 0 1-3.876 3.876l-.21.005H9.091l-.21-.005a4.09 4.09 0 0 1-3.876-3.876L5 18.91V9.091a4.09 4.09 0 0 1 3.88-4.086L9.09 5h9.82zM9.09 6.5A2.59 2.59 0 0 0 6.5 9.09v9.82a2.59 2.59 0 0 0 2.59 2.59h9.82a2.59 2.59 0 0 0 2.59-2.59V9.09a2.59 2.59 0 0 0-2.326-2.576l-.265-.014z"
        clipRule="evenodd"
      />
    </svg>
  );
};
