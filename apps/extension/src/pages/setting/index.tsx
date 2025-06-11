import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { PageButton } from "./components";
import {
  SettingIcon,
  RightArrowIcon,
  RocketLaunchIcon,
  KeyIcon,
} from "../../components/icon";
import { useNavigate } from "react-router";
import { Box } from "../../components/box";
import { FormattedMessage, useIntl } from "react-intl";
import { MainHeaderLayout } from "../main/layouts/header";
import { Body2, H3 } from "../../components/typography";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { Gutter } from "../../components/gutter";
import { SettingList } from "./components/setting-list";
import { useStore } from "../../stores";
import { useLanguage } from "../../languages";
import { useAppTheme } from "../../theme";
import { Toggle } from "../../components/toggle";
import { isRunningInSidePanel, toggleSidePanelMode } from "../../utils";
import {
  GetSidePanelEnabledMsg,
  GetSidePanelIsSupportedMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const { uiConfigStore } = useStore();

  const theme = useTheme();

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

  return (
    <MainHeaderLayout>
      <Box padding="1rem">
        <SettingList
          sections={[
            {
              key: "chains-and-assets",
              title: "Chains and Assets",
              items: [
                {
                  key: "add-remove-chains",
                  icon: IconAddRemoveChains,
                  title: "Add / Remove Chains",
                },
                {
                  key: "delete-custom-chains",
                  icon: IconDeleteCustomChains,
                  title: "Delete Custom Chains",
                },
                {
                  key: "add-remove-custom-token",
                  title: "Add / Remove Custom Token",
                },
              ],
            },
            {
              key: "general",
              title: "General",
              items: [
                {
                  key: "language",
                  title: "Language",
                  right: LanguageRight,
                  rightProps: {},
                },
                {
                  key: "currency",
                  title: "Currency",
                  right: CurrencyRight,
                  rightProps: {},
                },
                {
                  key: "theme",
                  title: "Theme",
                  right: ThemeRight,
                  rightProps: {},
                },
                ...(() => {
                  if (sidePanelSupported) {
                    return [
                      {
                        key: "side-panel",
                        title: "Side Panel",
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
                  title: "Show 24h Price Change",
                  right: Toggle,
                  rightProps: {
                    size: "smaller",
                    isOpen: uiConfigStore.show24HChangesInMagePage,
                    setIsOpen: () => {
                      uiConfigStore.toggleShow24HChangesInMagePage();
                    },
                  },
                },
              ],
            },
          ]}
        />
      </Box>
      <Box padding="0.75rem" paddingTop="0">
        <Box paddingY="1.15rem" alignX="center" alignY="center">
          <H3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette.white
            }
          >
            <FormattedMessage id="page.setting.title" />
          </H3>
        </Box>
        <Gutter size="0.5rem" />
        <Stack gutter="0.5rem">
          <PageButton
            title={intl.formatMessage({ id: "page.setting.general-title" })}
            paragraph={intl.formatMessage({
              id: "page.setting.general-paragraph",
            })}
            startIcon={<SettingIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/general")}
          />

          <PageButton
            title={intl.formatMessage({ id: "page.setting.advanced-title" })}
            paragraph={intl.formatMessage({
              id: "page.setting.advanced-paragraph",
            })}
            startIcon={<RocketLaunchIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/advanced")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.security-privacy-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.security-privacy-paragraph",
            })}
            startIcon={<KeyIcon width="1rem" height="1rem" />}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/security")}
          />

          <PageButton
            title={intl.formatMessage({
              id: "page.setting.manage-token-list-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.setting.manage-token-list-paragraph",
            })}
            endIcon={<RightArrowIcon />}
            onClick={() => navigate("/setting/token/list")}
          />
        </Stack>
      </Box>
    </MainHeaderLayout>
  );
});

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

  return (
    // TODO: intl
    <Body2 color={ColorPalette["gray-300"]}>{theme.option}</Body2>
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
