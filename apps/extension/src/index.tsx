// Shim ------------
require("setimmediate");
// Shim ------------

// Make sure that icon file will be included in bundle
require("./public/assets/logo-256.png");
require("./public/assets/icon/icon-16.png");
require("./public/assets/icon/icon-48.png");
require("./public/assets/icon/icon-128.png");
require("./public/assets/logo-beta-256.png");
require("./public/assets/icon/icon-beta-16.png");
require("./public/assets/icon/icon-beta-48.png");
require("./public/assets/icon/icon-beta-128.png");
require("./public/assets/svg/megaphone.svg");
require("./public/assets/img/locked-keplr-logo-128.png");
require("./public/assets/icon-click-cursor.png");

import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./stores";
import {
  GlobalPopupStyle,
  GlobalSidePanelStyle,
  GlobalStyle,
  ScrollBarStyle,
} from "./styles";
import { configure } from "mobx";
import { observer } from "mobx-react-lite";
import { Keplr } from "@keplr-wallet/provider";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import manifest from "./manifest.v2.json";
import { WalletStatus } from "@keplr-wallet/stores";
import { UnlockPage } from "./pages/unlock";
import { MainPage } from "./pages/main";
import { SettingPage } from "./pages/setting";
import { SettingGeneralPage } from "./pages/setting/general";
import { SettingGeneralFiatPage } from "./pages/setting/general/fiat";
import { SettingGeneralThemePage } from "./pages/setting/general/theme";
import { SettingGeneralAuthZPage } from "./pages/setting/general/authz";
import { SettingGeneralAuthZRevokePage } from "./pages/setting/general/authz/revoke";
import { SettingGeneralDeleteSuggestChainPage } from "./pages/setting/general/delete-suggest-chain";
import { SettingAdvancedPage } from "./pages/setting/advanced";
import { SettingSecurityPage } from "./pages/setting/security";
import { SettingSecurityPermissionPage } from "./pages/setting/security/permission";
import { PermissionPage } from "./pages/permission";
import { SignCosmosADR36Page, SignCosmosTxPage } from "./pages/sign/cosmos";
import { SettingTokenListPage } from "./pages/setting/token/manage";
import { SettingTokenAddPage } from "./pages/setting/token/add";
import { SettingGeneralLanguagePage } from "./pages/setting/general/language";
import { SettingAdvancedEndpointPage } from "./pages/setting/advanced/endpoint";
import { SettingGeneralLinkKeplrMobilePage } from "./pages/setting/general/link-keplr-mobile";
import { SettingContactsList } from "./pages/setting/contacts/list";
import { SettingContactsAdd } from "./pages/setting/contacts/add";
import { SendAmountPage } from "./pages/send/amount";
import { SendSelectAssetPage } from "./pages/send/select-asset";
import {
  WalletChangeNamePage,
  WalletDeletePage,
  WalletSelectPage,
  WalletShowSensitivePage,
} from "./pages/wallet";
import { SuggestChainPage } from "./pages/suggest-chain";
import { ModalRootProvider } from "./components/modal";
import { ConfirmProvider } from "./hooks/confirm";
import { NotificationProvider } from "./hooks/notification";
import { SettingSecurityChangePasswordPage } from "./pages/setting/security/change-password";
import { AppIntlProvider } from "./languages";
import { SettingSecurityAutoLockPage } from "./pages/setting/security/auto-lock";
import { useLoadFonts } from "./use-load-fonts";
import { useAutoLockMonitoring } from "./use-auto-lock-monitoring";
import { Splash } from "./components/splash";
import { IBCTransferPage } from "./pages/ibc-transfer";
import { SignCosmosICNSPage } from "./pages/sign/cosmos/icns";
import { ErrorBoundary } from "./error-boundary";
import { useMatchPopupSize } from "./popup-size";
import { SignEthereumTxPage } from "./pages/sign/ethereum";
import "simplebar-react/dist/simplebar.min.css";
import { AppThemeProvider } from "./theme";
import { useTheme } from "styled-components";
import { PageChangeScrollTop } from "./use-page-change-scroll-top";
import { IBCSwapPage } from "./pages/ibc-swap";
import {
  BottomTabActivityIcon,
  BottomTabHomeIcon,
  BottomTabSettingIcon,
  BottomTabsRouteProvider,
  BottomTabSwapIcon,
} from "./bottom-tabs";
import { IBCSwapDestinationSelectAssetPage } from "./pages/ibc-swap/select-asset";
import { RoutePageAnalytics } from "./route-page-analytics";
import { useIntl } from "react-intl";
import { ActivitiesPage } from "./pages/activities";
import { isRunningInSidePanel } from "./utils";
import { StarknetSendPage } from "./pages/starknet/send";
import { SignStarknetTxPage } from "./pages/starknet/sign/tx";
import { SignStarknetMessagePage } from "./pages/starknet/sign/message";
import { TxResultFailedPage } from "./pages/tx-result/failed";
import { TxResultPendingPage } from "./pages/tx-result/pending";
import { TxResultSuccessPage } from "./pages/tx-result/success";
import { EarnAmountPage } from "./pages/earn/amount";
import { EarnIntroPage } from "./pages/earn/intro";
import { EarnConfirmUsdnEstimationPage } from "./pages/earn/confirm-usdn-estimation";
import { EarnNobleTermsPage } from "./pages/earn/noble-terms";
import { EarnTransferIntroPage } from "./pages/earn/transfer/intro";
import { EarnTransferAmountPage } from "./pages/earn/transfer/amount";
import { EarnOverviewPage } from "./pages/earn/overview";
import { EarnWithdrawAmountPage } from "./pages/earn/withdraw/amount";

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

const RoutesAfterReady: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    keyRingStore,
    tokenFactoryRegistrar,
    erc20CurrencyRegistrar,
    ibcCurrencyRegistrar,
    lsmCurrencyRegistrar,
    ibcChannelStore,
    gravityBridgeCurrencyRegistrar,
    axelarEVMBridgeCurrencyRegistrar,
    priceStore,
    price24HChangesStore,
    interactionStore,
    uiConfigStore,
  } = useStore();

  const { isLoaded: isFontLoaded } = useLoadFonts();

  useAutoLockMonitoring();

  const openRegisterOnce = useRef(false);
  const initAccountsOnce = useRef(false);

  const _isReady: boolean = useMemo(() => {
    if (keyRingStore.status === "not-loaded") {
      return false;
    }

    if (keyRingStore.status === "empty") {
      if (!openRegisterOnce.current) {
        openRegisterOnce.current = true;
        browser.tabs
          .create({
            url: "/register.html#",
          })
          .then(() => {
            window.close();
          });
      }

      return false;
    }

    if (!isFontLoaded) {
      return false;
    }

    if (chainStore.isInitializing) {
      return false;
    }

    if (keyRingStore.status === "unlocked") {
      if (!initAccountsOnce.current) {
        initAccountsOnce.current = true;
        // XXX: Below logic not observe state changes on account store and it's inner state.
        //      This is intended because this logic is only for the first time and avoid global re-rendering.
        // Start init for registered chains so that users can see account address more quickly.
        for (const modularChainInfo of chainStore.modularChainInfos) {
          const account = accountStore.getAccount(modularChainInfo.chainId);
          // Because {autoInit: true} is given as the option on account store,
          // initialization for the account starts at this time just by using getAccount().
          // However, run safe check on current status and init if status is not inited.
          if (account.walletStatus === WalletStatus.NotInit) {
            account.init();
          }
        }
      }
    }

    if (!tokenFactoryRegistrar.isInitialized) {
      return false;
    }

    if (!ibcCurrencyRegistrar.isInitialized) {
      return false;
    }

    if (!lsmCurrencyRegistrar.isInitialized) {
      return false;
    }

    if (!priceStore.isInitialized) {
      return false;
    }

    if (!price24HChangesStore.isInitialized) {
      return false;
    }

    if (!uiConfigStore.isInitialized) {
      return false;
    }

    if (uiConfigStore.isDeveloper) {
      if (!ibcChannelStore.isInitialized) {
        return false;
      }
    }

    if (!gravityBridgeCurrencyRegistrar.isInitialized) {
      return false;
    }

    if (!axelarEVMBridgeCurrencyRegistrar.isInitialized) {
      return false;
    }

    if (!interactionStore.isInitialized) {
      return false;
    }

    if (!erc20CurrencyRegistrar.isInitialized) {
      return false;
    }

    return true;
  }, [
    keyRingStore.status,
    isFontLoaded,
    chainStore.isInitializing,
    chainStore.chainInfos,
    tokenFactoryRegistrar.isInitialized,
    erc20CurrencyRegistrar.isInitialized,
    ibcCurrencyRegistrar.isInitialized,
    lsmCurrencyRegistrar.isInitialized,
    priceStore.isInitialized,
    price24HChangesStore.isInitialized,
    uiConfigStore.isInitialized,
    uiConfigStore.isDeveloper,
    gravityBridgeCurrencyRegistrar.isInitialized,
    axelarEVMBridgeCurrencyRegistrar.isInitialized,
    interactionStore.isInitialized,
    accountStore,
    ibcChannelStore.isInitialized,
  ]);

  const checkIsStartFromInteractionWithSidePanelEnabledOnce = useRef(false);
  const hasBeenReady = useRef(false);

  const isReady: boolean = (() => {
    if (hasBeenReady.current) {
      // 이미 ready 상태가 한번 되었다면 계속 강제로 ready 상태를 유지한다.
      return true;
    }

    if (!_isReady) {
      return false;
    }

    if (!checkIsStartFromInteractionWithSidePanelEnabledOnce.current) {
      checkIsStartFromInteractionWithSidePanelEnabledOnce.current = true;
      // side panel에서 돌아가고 있으면서 최초의 isReady 상태일때 interaction이 있었는지 확인한다.
      // 만약 내부의 interaction이라면 UI가 보이기도 전에 뭔가가 요청됐을리가 없으므로
      // 최초로 interaction을 가지고 시작했다면 외부의 요청에 의한 interaction이다.
      if (isRunningInSidePanel() && interactionStore.data.length !== 0) {
        window.isStartFromInteractionWithSidePanelEnabled = true;
      }
    }

    if (keyRingStore.status === "unlocked") {
      // mobx의 특성상 밑의 로직은 useMemo 안에서 처리할 수가 없어서 분리되었음.
      const firstAccount = accountStore.getAccount(
        chainStore.chainInfos[0].chainId
      );
      if (
        firstAccount.walletStatus === WalletStatus.NotInit ||
        firstAccount.walletStatus === WalletStatus.Loading
      ) {
        return false;
      }
    }

    hasBeenReady.current = true;
    return true;
  })();

  const shouldUnlockPage = keyRingStore.status === "locked";

  const [mainPageIsNotReady, setMainPageIsNotReady] = useState(false);

  const intl = useIntl();

  // Enable new EVM chains by default for a specific version.
  useEffect(() => {
    const newEVMChainsEnabledLocalStorageKey = "new-evm-chain-enabled";
    const newEVMChainsEnabled = localStorage.getItem(
      newEVMChainsEnabledLocalStorageKey
    );
    if (
      isReady &&
      newEVMChainsEnabled !== "true" &&
      uiConfigStore.changelogConfig.showingInfo.some(
        (info) => info.version === "0.12.115"
      )
    ) {
      for (const keyInfo of keyRingStore.keyInfos) {
        chainStore.enableChainInfoInUIWithVaultId(
          keyInfo.id,
          ...chainStore.chainInfos
            .filter((chainInfo) => chainInfo.chainId.startsWith("eip155:"))
            .map((chainInfo) => chainInfo.chainId)
        );
      }
      localStorage.setItem(newEVMChainsEnabledLocalStorageKey, "true");
    }
  }, [
    chainStore,
    isReady,
    keyRingStore.keyInfos,
    uiConfigStore.changelogConfig.showingInfo,
    uiConfigStore.newChainSuggestionConfig.newSuggestionChains,
  ]);

  return (
    <HashRouter>
      <BottomTabsRouteProvider
        isNotReady={!isReady || mainPageIsNotReady}
        forceHideBottomTabs={shouldUnlockPage}
        tabs={[
          {
            pathname: "/",
            icon: <BottomTabHomeIcon width="1.75rem" height="1.75rem" />,
            text: intl.formatMessage({
              id: "bottom-tabs.home",
            }),
          },
          {
            pathname: "/ibc-swap",
            icon: <BottomTabSwapIcon width="1.75rem" height="1.75rem" />,
            text: intl.formatMessage({
              id: "bottom-tabs.swap",
            }),
          },
          {
            pathname: "/activities",
            icon: <BottomTabActivityIcon width="1.75rem" height="1.75rem" />,
            text: intl.formatMessage({
              id: "bottom-tabs.activity",
            }),
          },
          {
            pathname: "/setting",
            icon: <BottomTabSettingIcon width="1.75rem" height="1.75rem" />,
            text: intl.formatMessage({
              id: "bottom-tabs.settings",
            }),
          },
        ]}
      >
        <PageChangeScrollTop />
        <RoutePageAnalytics />
        {isReady ? (
          shouldUnlockPage ? (
            <UnlockPage />
          ) : (
            <Routes>
              <Route path="/unlock" element={<UnlockPage />} />
              <Route
                path="/"
                element={<MainPage setIsNotReady={setMainPageIsNotReady} />}
              />
              <Route path="/send" element={<SendAmountPage />} />
              <Route path="/starknet/send" element={<StarknetSendPage />} />
              <Route path="/ibc-swap" element={<IBCSwapPage />} />
              <Route
                path="/send/select-asset"
                element={<SendSelectAssetPage />}
              />
              <Route
                path="/ibc-swap/select-destination"
                element={<IBCSwapDestinationSelectAssetPage />}
              />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/setting" element={<SettingPage />} />
              <Route path="/setting/general" element={<SettingGeneralPage />} />
              <Route
                path="/setting/general/language"
                element={<SettingGeneralLanguagePage />}
              />
              <Route
                path="/setting/general/fiat"
                element={<SettingGeneralFiatPage />}
              />
              <Route
                path="/setting/general/theme"
                element={<SettingGeneralThemePage />}
              />
              <Route
                path="/setting/general/authz"
                element={<SettingGeneralAuthZPage />}
              />
              <Route
                path="/setting/general/authz/revoke"
                element={<SettingGeneralAuthZRevokePage />}
              />
              <Route
                path="/setting/general/link-keplr-mobile"
                element={<SettingGeneralLinkKeplrMobilePage />}
              />
              <Route
                path="setting/general/delete-suggest-chain"
                element={<SettingGeneralDeleteSuggestChainPage />}
              />
              <Route
                path="/setting/advanced"
                element={<SettingAdvancedPage />}
              />
              <Route
                path="/setting/advanced/endpoint"
                element={<SettingAdvancedEndpointPage />}
              />
              <Route
                path="/setting/security"
                element={<SettingSecurityPage />}
              />
              <Route
                path="/setting/security/permission"
                element={<SettingSecurityPermissionPage />}
              />
              <Route
                path="/setting/security/auto-lock"
                element={<SettingSecurityAutoLockPage />}
              />
              <Route
                path="/setting/security/change-password"
                element={<SettingSecurityChangePasswordPage />}
              />
              <Route
                path="/setting/token/list"
                element={<SettingTokenListPage />}
              />
              <Route
                path="/setting/token/add"
                element={<SettingTokenAddPage />}
              />
              <Route
                path="/setting/contacts/list"
                element={<SettingContactsList />}
              />
              <Route
                path="/setting/contacts/add"
                element={<SettingContactsAdd />}
              />
              <Route path="/permission" element={<PermissionPage />} />
              <Route path="/sign-cosmos" element={<SignCosmosTxPage />} />
              <Route
                path="/sign-cosmos-adr36"
                element={<SignCosmosADR36Page />}
              />
              <Route
                path="/sign-cosmos-icns"
                element={<SignCosmosICNSPage />}
              />
              <Route path="/sign-ethereum" element={<SignEthereumTxPage />} />
              <Route
                path="/sign-starknet-tx"
                element={<SignStarknetTxPage />}
              />
              <Route
                path="/sign-starknet-message"
                element={<SignStarknetMessagePage />}
              />
              <Route path="/wallet/select" element={<WalletSelectPage />} />
              <Route path="/wallet/delete" element={<WalletDeletePage />} />
              <Route
                path="/wallet/change-name"
                element={<WalletChangeNamePage />}
              />
              <Route
                path="/wallet/show-sensitive"
                element={<WalletShowSensitivePage />}
              />
              <Route path="/suggest-chain" element={<SuggestChainPage />} />
              <Route path="/ibc-transfer" element={<IBCTransferPage />} />
              <Route
                path="/tx-result/pending"
                element={<TxResultPendingPage />}
              />
              <Route
                path="/tx-result/success"
                element={<TxResultSuccessPage />}
              />
              <Route
                path="/tx-result/failed"
                element={<TxResultFailedPage />}
              />
              <Route path="/earn/intro" element={<EarnIntroPage />} />
              <Route path="/earn/amount" element={<EarnAmountPage />} />
              <Route
                path="/earn/transfer/intro"
                element={<EarnTransferIntroPage />}
              />
              <Route
                path="/earn/transfer/amount"
                element={<EarnTransferAmountPage />}
              />
              <Route
                path="/earn/confirm-usdn-estimation"
                element={<EarnConfirmUsdnEstimationPage />}
              />
              <Route
                path="/earn/noble-terms"
                element={<EarnNobleTermsPage />}
              />
              <Route path="/earn/overview" element={<EarnOverviewPage />} />
              <Route
                path="/earn/withdraw/amount"
                element={<EarnWithdrawAmountPage />}
              />
            </Routes>
          )
        ) : (
          <Splash />
        )}
        <LightModeBackground
          isReady={isReady}
          shouldUnlockPage={shouldUnlockPage}
        />
      </BottomTabsRouteProvider>
    </HashRouter>
  );
});

const LightModeBackground: FunctionComponent<{
  isReady: boolean;
  shouldUnlockPage: boolean;
}> = ({ isReady, shouldUnlockPage }) => {
  const theme = useTheme();
  const location = useLocation();

  useLayoutEffect(() => {
    if (isReady && !shouldUnlockPage) {
      if (
        location.pathname === "/setting" ||
        location.pathname.startsWith("/setting/") ||
        location.pathname === "/send" ||
        location.pathname.startsWith("/send/")
      ) {
        document.documentElement.setAttribute("data-white-background", "true");
        document.body.setAttribute("data-white-background", "true");

        return () => {
          document.documentElement.removeAttribute("data-white-background");
          document.body.removeAttribute("data-white-background");
        };
      }
    }
  }, [location.pathname, theme, isReady, shouldUnlockPage]);

  return null;
};

const App: FunctionComponent = () => {
  useMatchPopupSize();

  return (
    <StoreProvider>
      <AppThemeProvider>
        <AppIntlProvider>
          <ModalRootProvider>
            <ConfirmProvider>
              <NotificationProvider>
                <GlobalStyle />
                {
                  // isRunningInSidePanel()은 반응형이 아니지만 어차피 popup <-> sidePanel은 실행시점에 정해지고
                  // UI가 작동중에 변경될 수 없기 때문에 이렇게 해도 괜찮다.
                  isRunningInSidePanel() ? (
                    <GlobalSidePanelStyle />
                  ) : (
                    <GlobalPopupStyle />
                  )
                }
                <ScrollBarStyle />
                <ErrorBoundary>
                  <RoutesAfterReady />
                </ErrorBoundary>
              </NotificationProvider>
            </ConfirmProvider>
          </ModalRootProvider>
        </AppIntlProvider>
      </AppThemeProvider>
    </StoreProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
