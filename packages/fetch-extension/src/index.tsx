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
import { IBCTransferPage } from "./pages/ibc-transfer";
import { LockPage } from "./pages/lock";
import { MainPage } from "./pages/main";
import { MorePage } from "./pages/more";
import { RegisterPage } from "./pages/register";
import { SendPage } from "./pages/send";
import { SetKeyRingPage } from "./pages/setting/keyring";

import { Banner } from "@components/banner";

import { ConfirmProvider } from "@components/confirm";
import { LoadingIndicatorProvider } from "@components/loading-indicator";
import {
  NotificationProvider,
  NotificationStoreProvider,
} from "@components/notification";

import { configure } from "mobx";
import { observer } from "mobx-react-lite";

import {
  KeyRingStatus,
  StartAutoLockMonitoringMsg,
} from "@keplr-wallet/background";
import Modal from "react-modal";
import { LedgerGrantPage } from "./pages/ledger";
import { SettingPage } from "./pages/setting";
import { AddressBookPage } from "./pages/setting/address-book";
import { ClearPage } from "./pages/setting/clear";
import {
  SettingConnectionsPage,
  SettingSecret20ViewingKeyConnectionsPage,
} from "./pages/setting/connections";
import { ExportPage } from "./pages/setting/export";
import { SettingFiatPage } from "./pages/setting/fiat";
import { ChangeNamePage } from "./pages/setting/keyring/change";
import { SettingLanguagePage } from "./pages/setting/language";
import { AddTokenPage } from "./pages/setting/token/add";
import { ManageTokenPage } from "./pages/setting/token/manage";
import { StoreProvider, useStore } from "./stores";

import { AdditionalIntlMessages, LanguageToFiatCurrency } from "./config.ui";

import { Keplr } from "@keplr-wallet/provider";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import manifest from "./manifest.v2.json";
import { ChatPage } from "./pages/chat";
import { ChatSection } from "./pages/chat-section";
import { ExportToMobilePage } from "./pages/setting/export-to-mobile";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { ChatStoreProvider } from "@components/chat/store";
import { NewChat } from "./pages/new-chat";
import { ChatSettings } from "./pages/setting/chat";
import { BlockList } from "./pages/setting/chat/block";
import { Privacy } from "./pages/setting/chat/privacy";
import { ReadRecipt } from "./pages/setting/chat/readRecipt";
import { CreateGroupChat } from "./pages/group-chat/create-group-chat";
import { AddMember } from "./pages/group-chat/add-member";
import { ReviewGroupChat } from "./pages/group-chat/review-details";
import { GroupChatSection } from "./pages/group-chat/chat-section";
import { EditMember } from "./pages/group-chat/edit-member";
import { AgentChatSection } from "./pages/agent-chat-section";
import { NotificationOrganizations } from "./pages/notiphy-notification/notification-organizations";
import { NotificationTopics } from "./pages/notiphy-notification/notification-topics";
import { SettingNotifications } from "./pages/setting/notification";
import { ReviewNotification } from "./pages/notiphy-notification/review-notification";
import { KeystoneImportPubkeyPage } from "./pages/keystone";
import { KeystoneSignPage } from "./pages/keystone/sign";
import { SettingEndpointsPage } from "./pages/setting/endpoints";
import { SettingAutoLockPage } from "./pages/setting/autolock";
import { SettingSecurityPrivacyPage } from "./pages/setting/security-privacy";
import { ChainActivePage } from "./pages/setting/chain-active";
import { SettingPermissionsGetChainInfosPage } from "./pages/setting/security-privacy/permissions/get-chain-infos";
import { AuthZPage } from "./pages/authz";
import { ICNSAdr36SignPage } from "./pages/icns/sign";
import { SignPage } from "./pages/sign";
import { ChainSuggestedPage } from "./pages/chain/suggest";
import { GrantGlobalPermissionGetChainInfosPage } from "./pages/permission/grant";
import { ValidatorList } from "./pages/validator-list";
import { Validator } from "./pages/validator";
import { StakeComplete } from "./pages/validator/stake-complete";
import { ActivityPage } from "./pages/activity";
import { Proposals } from "./pages/proposals";
import { ProposalDetail } from "./pages/proposals/proposal-detail";
import { PropsalVoteStatus } from "./pages/proposals/proposal-vote-status";
import { FetchnameService } from "./pages/fetch-name-service";
import { DomainDetails } from "./pages/fetch-name-service/domain-details";
import { BridgePage } from "./pages/bridge";
import { BridgeHistoryView } from "./pages/bridge/bridge-history";
import { AddEvmChain } from "./pages/setting/addEvmChain";

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

// Make sure that icon file will be included in bundle
require("@assets/logo-256.svg");
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
      <div style={{ height: "100%" }}>
        <Banner
          icon={require("@assets/logo-256.svg")}
          logo={require("@assets/brand-text.png")}
        />
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
                      <Route
                        path="/ledger-grant"
                        element={<LedgerGrantPage />}
                      />
                      <Route
                        path="/setting/language"
                        element={<SettingLanguagePage />}
                      />
                      <Route
                        path="/setting/fiat"
                        element={<SettingFiatPage />}
                      />
                      <Route
                        path="/setting/connections"
                        element={<SettingConnectionsPage />}
                      />
                      <Route
                        path="/setting/connections/viewing-key/:contractAddress"
                        element={<SettingSecret20ViewingKeyConnectionsPage />}
                      />
                      <Route
                        path="/setting/address-book"
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
                        path="/setting/export/:index"
                        element={<ExportPage />}
                      />
                      <Route
                        path="/setting/clear/:index"
                        element={<ClearPage />}
                      />
                      <Route
                        path="/setting/keyring/change/name/:index"
                        element={<ChangeNamePage />}
                      />
                      <Route
                        path="/setting/token/add"
                        element={<AddTokenPage />}
                      />
                      <Route
                        path="/setting/token/manage"
                        element={<ManageTokenPage />}
                      />
                      <Route
                        path="/setting/endpoints"
                        element={<SettingEndpointsPage />}
                      />
                      <Route
                        path="/setting/autolock"
                        element={<SettingAutoLockPage />}
                      />
                      <Route
                        path="/setting/security-privacy"
                        element={<SettingSecurityPrivacyPage />}
                      />
                      <Route path="/sign" element={<SignPage />} />
                      <Route
                        path="/icns/adr36-signatures"
                        element={<ICNSAdr36SignPage />}
                      />
                      <Route
                        path="/suggest-chain"
                        element={<ChainSuggestedPage />}
                      />
                      <Route
                        path="/permissions/grant/get-chain-infos"
                        element={<GrantGlobalPermissionGetChainInfosPage />}
                      />
                      <Route
                        path="/setting/permissions/get-chain-infos"
                        element={<SettingPermissionsGetChainInfosPage />}
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
                      <Route path="/more" element={<MorePage />} />
                      <Route
                        path="/setting/notifications"
                        element={<SettingNotifications />}
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
