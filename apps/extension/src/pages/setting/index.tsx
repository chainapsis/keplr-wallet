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
import { SearchTextInput } from "../../components/input";

export const SettingPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const { keyRingStore, uiConfigStore } = useStore();

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

  const [searchText, setSearchText] = useState<string>("");

  return (
    <MainHeaderLayout>
      <Box paddingY="1rem">
        <Box paddingX="1rem">
          <SearchTextInput
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Box>
        <SettingList
          search={searchText}
          sections={[
            {
              key: "chains-and-assets",
              title: "Chains and Assets",
              items: [
                {
                  key: "add-remove-chains",
                  icon: IconAddRemoveChains,
                  title: "Add / Remove Chains",
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
                  title: "Delete Custom Chains",
                  right: ClickableRightIcon,
                  rightProps: {},
                  onClick: () =>
                    navigate("/setting/advanced/delete-suggest-chain"),
                },
                {
                  key: "add-remove-custom-token",
                  icon: IconAddRemoveCustomTokens,
                  title: "Add / Remove Custom Token",
                  right: ClickableRightIcon,
                  rightProps: {},
                  onClick: () => navigate("/setting/token/list"),
                },
              ],
            },
            {
              key: "general",
              title: "General",
              items: [
                {
                  key: "language",
                  icon: IconLanguage,
                  title: "Language",
                  right: LanguageRight,
                  rightProps: {},
                  onClick: () => navigate("/setting/general/language"),
                },
                {
                  key: "currency",
                  icon: IconCurrency,
                  title: "Currency",
                  right: CurrencyRight,
                  rightProps: {},
                  onClick: () => navigate("/setting/general/fiat"),
                },
                {
                  key: "theme",
                  icon: IconTheme,
                  title: "Theme",
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
                  icon: Icon24HPrice,
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
                {
                  key: "advanced",
                  icon: IconAdvanced,
                  title: "Advanced",
                  subtitles: ["Endpoints", "Authz", "Manual IBC Transfer"],
                  onClick: () => navigate("/setting/advanced"),
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

  return (
    // TODO: intl
    <Body2 color={ColorPalette["gray-300"]}>
      {capitalizeFirstLetter(theme.option)}
    </Body2>
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
