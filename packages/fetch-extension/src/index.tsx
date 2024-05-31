/* eslint-disable react/no-deprecated */
// Shim ------------

import { ErrorBoundary } from "./error-boundary";

require("setimmediate");
// Shim ------------
import React, { FunctionComponent, useEffect } from "react";
import ReactDOM from "react-dom";

import { AppIntlProvider } from "./languages";

import "./styles/global.scss";

import { HashRouter, Route, Routes } from "react-router-dom";

import { AccessPage, Secret20ViewingKeyAccessPage } from "./pages/access";
import { NotificationPage } from "./pages/notification";
import { IBCTransferPage } from "./pages-new/more/ibc-transfer";

import { MainPage } from "./pages-new/main";
import { RegisterPage } from "./pages-new/register";
import { SendPage } from "./pages-new/send";
import { SetKeyRingPage } from "./pages/setting/keyring";
import { Banner } from "@components/banner";
import { ConfirmProvider } from "@components/confirm";
import { LoadingIndicatorProvider } from "@components/loading-indicator";
import {
  NotificationProvider,
  NotificationStoreProvider,
} from "@components/notification";
import { LockPage } from "./pages-new/lock";

import { configure } from "mobx";
import { observer } from "mobx-react-lite";

import {
  KeyRingStatus,
  StartAutoLockMonitoringMsg,
} from "@keplr-wallet/background";
import Modal from "react-modal";
import { AddressBookPage } from "./pages-new/more/address-book";
import { CurrencyPge } from "./pages-new/more/currency";
import {
  SettingConnectionsPage,
  SettingSecret20ViewingKeyConnectionsPage,
} from "./pages-new/more/security-privacy/connections";
import { AddTokenPage } from "./pages-new/more/token/add";
import { ManageTokenPage } from "./pages-new/more/token/manage";
import { LedgerGrantPage } from "./pages/ledger";
import { SettingPage } from "./pages/setting";
import { StoreProvider, useStore } from "./stores";

import { AdditionalIntlMessages, LanguageToFiatCurrency } from "./config.ui";

import { ChatStoreProvider } from "@components/chat/store";
import { Keplr } from "@keplr-wallet/provider";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import manifest from "./manifest.v2.json";
import { ActivityPage } from "./pages-new/activity";
import { ActivityDetails } from "./pages-new/activity/activity-details";
import { AssetView } from "./pages-new/asset-view";

import { ChangeNamePageV2 } from "./pages-new/keyring-dev/change";
import { MorePage } from "./pages-new/more";
import { AppVersion } from "./pages-new/more/app-version";
import { MoreLanguagePage } from "./pages-new/more/language";
import { MoreNotifications } from "./pages-new/more/notification";
import { NotificationOrganizations } from "./pages-new/more/notification/notiphy-notification/notification-organizations";
import { NotificationTopics } from "./pages-new/more/notification/notiphy-notification/notification-topics";
import { SecurityPrivacyPage } from "./pages-new/more/security-privacy";
import { AutoLockPage } from "./pages-new/more/security-privacy/autolock";
import { PermissionsGetChainInfosPage } from "./pages-new/more/security-privacy/permissions/get-chain-infos";
import { ExportPage } from "./pages-new/more/view-mnemonic-seed";
import { Portfolio } from "./pages-new/portfolio";
import { Receive } from "./pages-new/receive";
import { SignPageV2 } from "./pages-new/sign";
import { AgentChatSection } from "./pages/agent-chat-section";
import { AuthZPage } from "./pages/authz";
import { BridgeHistoryView } from "./pages/bridge/bridge-history";
import { ChainSuggestedPage } from "./pages/chain/suggest";
import { ChatPage } from "./pages/chat";
import { ChatSection } from "./pages/chat-section";
import { FetchnameService } from "./pages/fetch-name-service";
import { DomainDetails } from "./pages/fetch-name-service/domain-details";
import { AddMember } from "./pages/group-chat/add-member";
import { GroupChatSection } from "./pages/group-chat/chat-section";
import { CreateGroupChat } from "./pages/group-chat/create-group-chat";
import { EditMember } from "./pages/group-chat/edit-member";
import { ReviewGroupChat } from "./pages/group-chat/review-details";
import { ICNSAdr36SignPage } from "./pages/icns/sign";
import { KeystoneImportPubkeyPage } from "./pages/keystone";
import { KeystoneSignPage } from "./pages/keystone/sign";
import { NewChat } from "./pages/new-chat";
import { ReviewNotification } from "./pages/notiphy-notification/review-notification";
import { GrantGlobalPermissionGetChainInfosPage } from "./pages/permission/grant";
import { Proposals } from "./pages/proposals";
import { ProposalDetail } from "./pages/proposals/proposal-detail";
import { PropsalVoteStatus } from "./pages/proposals/proposal-vote-status";
import { AddEvmChain } from "./pages/setting/addEvmChain";
import { ChainActivePage } from "./pages/setting/chain-active";
import { ChatSettings } from "./pages/setting/chat";
import { BlockList } from "./pages/setting/chat/block";
import { Privacy } from "./pages/setting/chat/privacy";
import { ReadRecipt } from "./pages/setting/chat/readRecipt";
import { SettingEndpointsPage } from "./pages/setting/endpoints";
import { ExportToMobilePage } from "./pages/setting/export-to-mobile";
import { Validator } from "./pages/validator";
import { ValidatorList } from "./pages/validator-list";
import { StakeComplete } from "./pages/validator/stake-complete";
import { ApproveAddChainByNetworkPage } from "./pages/approveAddChainByNetwork";
import { ApproveSwitchChainPage } from "./pages/approveSwitchChainPage";
import { ApproveSwitchAccountByAddressPage } from "./pages/approveSwitchAccountPage";
import { DeleteWallet } from "./pages-new/keyring-dev/delete";
import { AxelarBridgeEVM } from "./pages-unused/axelar-bridge/axelar-bridge-evm";
import { AxelarBridgeCosmos } from "./pages-unused/axelar-bridge/axelar-bridge-cosmos";
import { BridgePage } from "./pages/bridge";
import { ManageNetworks } from "./pages-new/more/manage-networks";

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

// Make sure that icon file will be included in bundle
require("@assets/svg/wireframe/LogoV2.svg");
require("@assets/icon/icon-16.png");
require("@assets/icon/icon-48.png");
require("@assets/icon/icon-128.png");

configure({
  enforceActions: "always", // Make mobx to strict mode.
});

Modal.setAppElement("#app");
Modal.defaultStyles = {
  content: {
    ...Modal.defaultStyles.content,
    minWidth: "300px",
    maxWidth: "600px",
    minHeight: "250px",
    maxHeight: "500px",
    left: "50%",
    right: "auto",
    top: "50%",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    zIndex: 1000,
    ...Modal.defaultStyles.overlay,
  },
};

const StateRenderer: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  useEffect(() => {
    // Notify to auto lock service to start activation check whenever the keyring is unlocked.
    if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
      const msg = new StartAutoLockMonitoringMsg();
      const requester = new InExtensionMessageRequester();
      requester.sendMessage(BACKGROUND_PORT, msg);
    }
  }, [keyRingStore.status]);

  if (keyRingStore.status === KeyRingStatus.UNLOCKED) {
    return <MainPage />;
  } else if (keyRingStore.status === KeyRingStatus.LOCKED) {
    return <LockPage />;
  } else if (keyRingStore.status === KeyRingStatus.EMPTY) {
    browser.tabs.create({
      url: "/popup.html#/register",
    });
    window.close();
    return (
      <div style={{ height: "100%" }}>
        <Banner
          icon={require("@assets/logo-256.svg")}
          logo={require("@assets/brand-text.png")}
        />
      </div>
    );
  } else if (keyRingStore.status === KeyRingStatus.NOTLOADED) {
    return (
      <div
        style={{
          height: "100%",
          backgroundColor: "#030e3b",
          backgroundImage: `url(${require("@assets/svg/wireframe/bg-onboarding.svg")})`,
        }}
      >
        <Banner icon={require("@assets/svg/wireframe/LogoV2.svg")} logo={""} />
      </div>
    );
  } else {
    return <div>Unknown status</div>;
  }
});

ReactDOM.render(
  <StoreProvider>
    <AppIntlProvider
      additionalMessages={AdditionalIntlMessages}
      languageToFiatCurrency={LanguageToFiatCurrency}
    >
      <LoadingIndicatorProvider>
        <NotificationStoreProvider>
          <NotificationProvider>
            <ConfirmProvider>
              <ErrorBoundary>
                <HashRouter>
                  <ChatStoreProvider>
                    <Routes>
                      <Route path="/" element={<StateRenderer />} />
                      <Route path="/unlock" element={<LockPage />} />
                      <Route path="/access" element={<AccessPage />} />
                      <Route
                        path="/access/viewing-key"
                        element={<Secret20ViewingKeyAccessPage />}
                      />
                      <Route
                        path="/activity-details"
                        element={<ActivityDetails />}
                      />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/send" element={<SendPage />} />
                      <Route
                        path="/ibc-transfer"
                        element={<IBCTransferPage />}
                      />
                      <Route path="/bridge" element={<BridgePage />} />
                      <Route
                        path="/bridge-history"
                        element={<BridgeHistoryView />}
                      />
                      <Route path="/setting" element={<SettingPage />} />
                      <Route
                        path="/keystone/import-pubkey"
                        element={<KeystoneImportPubkeyPage />}
                      />
                      <Route
                        path="/keystone/sign"
                        element={<KeystoneSignPage />}
                      />
                      <Route path="/app-version" element={<AppVersion />} />
                      <Route
                        path="/ledger-grant"
                        element={<LedgerGrantPage />}
                      />
                      <Route path="/more" element={<MorePage />} />
                      <Route
                        path="/more/language"
                        element={<MoreLanguagePage />}
                      />
                      <Route
                        path="/more/export/:index"
                        element={<ExportPage />}
                      />
                      <Route path="/more/currency" element={<CurrencyPge />} />
                      <Route
                        path="more/security-privacy/connections"
                        element={<SettingConnectionsPage />}
                      />
                      <Route
                        path="/more/connections/viewing-key/:contractAddress"
                        element={<SettingSecret20ViewingKeyConnectionsPage />}
                      />
                      <Route
                        path="/more/address-book"
                        element={<AddressBookPage />}
                      />
                      <Route path="/activity" element={<ActivityPage />} />
                      <Route
                        path="/setting/export-to-mobile"
                        element={<ExportToMobilePage />}
                      />
                      <Route
                        path="/fetch-name-service/:tab"
                        element={<FetchnameService />}
                      />
                      <Route
                        path="/fetch-name-service/domain-details/:domain"
                        element={<DomainDetails />}
                      />
                      <Route
                        path="/setting/set-keyring"
                        element={<SetKeyRingPage />}
                      />
                      <Route
                        path="/setting/clear/:index"
                        element={<DeleteWallet />}
                      />
                      <Route
                        path="/setting/keyring/change/name/:index"
                        element={<ChangeNamePageV2 />}
                      />
                      <Route
                        path="/more/token/add"
                        element={<AddTokenPage />}
                      />
                      <Route
                        path="/more/token/manage"
                        element={<ManageTokenPage />}
                      />
                      <Route
                        path="/setting/endpoints"
                        element={<SettingEndpointsPage />}
                      />
                      <Route
                        path="/more/security-privacy/autolock"
                        element={<AutoLockPage />}
                      />
                      <Route
                        path="/more/security-privacy"
                        element={<SecurityPrivacyPage />}
                      />
                      {/* <Route path="/sign" element={<SignPage />} /> */}
                      <Route path="/sign" element={<SignPageV2 />} />

                      <Route
                        path="/icns/adr36-signatures"
                        element={<ICNSAdr36SignPage />}
                      />
                      <Route
                        path="/suggest-chain"
                        element={<ChainSuggestedPage />}
                      />
                      <Route
                        path="/add-chain-by-network"
                        element={<ApproveAddChainByNetworkPage />}
                      />
                      <Route
                        path="/switch-chain-by-chainid"
                        element={<ApproveSwitchChainPage />}
                      />
                      <Route
                        path="/switch-account-by-address"
                        element={<ApproveSwitchAccountByAddressPage />}
                      />
                      <Route
                        path="/axl-bridge-evm"
                        element={<AxelarBridgeEVM />}
                      />
                      <Route
                        path="/axl-bridge-cosmos"
                        element={<AxelarBridgeCosmos />}
                      />
                      <Route
                        path="/permissions/grant/get-chain-infos"
                        element={<GrantGlobalPermissionGetChainInfosPage />}
                      />
                      <Route
                        path="/more/permissions/get-chain-infos"
                        element={<PermissionsGetChainInfosPage />}
                      />
                      <Route
                        path="/setting/chain-active"
                        element={<ChainActivePage />}
                      />
                      <Route path="/authz" element={<AuthZPage />} />
                      <Route
                        path="/notification"
                        element={<NotificationPage />}
                      />
                      <Route
                        path="/notification/organisations/:type"
                        element={<NotificationOrganizations />}
                      />
                      <Route
                        path="/notification/topics/:type"
                        element={<NotificationTopics />}
                      />
                      <Route
                        path="/notification/review"
                        element={<ReviewNotification />}
                      />
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/chat/:name" element={<ChatSection />} />
                      <Route path="/new-chat" element={<NewChat />} />
                      <Route
                        path="/chat/group-chat/create"
                        element={<CreateGroupChat />}
                      />
                      <Route
                        path="/chat/group-chat/add-member"
                        element={<AddMember />}
                      />
                      <Route
                        path="/chat/group-chat/edit-member"
                        element={<EditMember />}
                      />
                      <Route
                        path="/chat/group-chat/review-details"
                        element={<ReviewGroupChat />}
                      />
                      <Route
                        path="/chat/group-chat-section/:name"
                        element={<GroupChatSection />}
                      />
                      <Route
                        path="/chat/agent/:name"
                        element={<AgentChatSection />}
                      />
                      <Route
                        path="/more/notifications"
                        element={<MoreNotifications />}
                      />
                      <Route path="/setting/chat" element={<ChatSettings />} />
                      <Route
                        path="/setting/chat/block"
                        element={<BlockList />}
                      />
                      <Route
                        path="/setting/chat/privacy"
                        element={<Privacy />}
                      />
                      <Route
                        path="/setting/chat/readRecipt"
                        element={<ReadRecipt />}
                      />
                      <Route
                        path="/validators/:operation"
                        element={<ValidatorList />}
                      />
                      <Route
                        path="/validators/:validator_address/:operation"
                        element={<Validator />}
                      />
                      <Route
                        path="/stake-complete/:validator_address"
                        element={<StakeComplete />}
                      />
                      <Route path="/proposal" element={<Proposals />} />
                      <Route
                        path="/proposal-detail/:id"
                        element={<ProposalDetail />}
                      />
                      <Route
                        path="/proposal-vote-status/:votedOn/:id"
                        element={<PropsalVoteStatus />}
                      />
                      <Route
                        path="/setting/addEvmChain"
                        element={<AddEvmChain />}
                      />
                      <Route path="/receive" element={<Receive />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/asset" element={<AssetView />} />
                      <Route
                        path="/manage-networks"
                        element={<ManageNetworks />}
                      />

                      <Route path="*" element={<StateRenderer />} />
                    </Routes>
                  </ChatStoreProvider>
                </HashRouter>
              </ErrorBoundary>
            </ConfirmProvider>
          </NotificationProvider>
        </NotificationStoreProvider>
      </LoadingIndicatorProvider>
    </AppIntlProvider>
  </StoreProvider>,
  document.getElementById("app")
);
