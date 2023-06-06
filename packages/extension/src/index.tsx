import React, { FunctionComponent, useEffect } from "react";
import ReactDOM from "react-dom";

import { AppIntlProvider } from "./languages";

import "./styles/global.scss";

import { HashRouter, Route, Switch } from "react-router-dom";

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
import manifest from "./manifest.json";
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

window.keplr = new Keplr(
  manifest.version,
  "core",
  new InExtensionMessageRequester()
);

// Make sure that icon file will be included in bundle
require("@assets/logo-256.svg");
require("./public/assets/icon/icon-16.png");
require("./public/assets/icon/icon-48.png");
require("./public/assets/icon/icon-128.png");

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
              <HashRouter>
                <ChatStoreProvider>
                  <Switch>
                    <Route exact path="/" component={StateRenderer} />
                    <Route exact path="/unlock" component={LockPage} />
                    <Route exact path="/access" component={AccessPage} />
                    <Route
                      exact
                      path="/access/viewing-key"
                      component={Secret20ViewingKeyAccessPage}
                    />
                    <Route exact path="/register" component={RegisterPage} />
                    <Route exact path="/send" component={SendPage} />
                    <Route
                      exact
                      path="/ibc-transfer"
                      component={IBCTransferPage}
                    />
                    <Route exact path="/setting" component={SettingPage} />
                    <Route
                      exact
                      path="/keystone/import-pubkey"
                      component={KeystoneImportPubkeyPage}
                    />
                    <Route
                      exact
                      path="/keystone/sign"
                      component={KeystoneSignPage}
                    />
                    <Route
                      exact
                      path="/ledger-grant"
                      component={LedgerGrantPage}
                    />
                    <Route
                      exact
                      path="/setting/language"
                      component={SettingLanguagePage}
                    />
                    <Route
                      exact
                      path="/setting/fiat"
                      component={SettingFiatPage}
                    />
                    <Route
                      exact
                      path="/setting/connections"
                      component={SettingConnectionsPage}
                    />
                    <Route
                      exact
                      path="/setting/connections/viewing-key/:contractAddress"
                      component={SettingSecret20ViewingKeyConnectionsPage}
                    />
                    <Route
                      exact
                      path="/setting/address-book"
                      component={AddressBookPage}
                    />
                    <Route
                      exact
                      path="/setting/export-to-mobile"
                      component={ExportToMobilePage}
                    />
                    <Route
                      exact
                      path="/setting/set-keyring"
                      component={SetKeyRingPage}
                    />
                    <Route
                      exact
                      path="/setting/export/:index"
                      component={ExportPage}
                    />
                    <Route
                      exact
                      path="/setting/clear/:index"
                      component={ClearPage}
                    />
                    <Route
                      exact
                      path="/setting/keyring/change/name/:index"
                      component={ChangeNamePage}
                    />
                    <Route
                      exact
                      path="/setting/token/add"
                      component={AddTokenPage}
                    />
                    <Route
                      exact
                      path="/setting/token/manage"
                      component={ManageTokenPage}
                    />
                    <Route
                      exact
                      path="/setting/endpoints"
                      component={SettingEndpointsPage}
                    />
                    <Route
                      exact
                      path="/setting/autolock"
                      component={SettingAutoLockPage}
                    />
                    <Route
                      exact
                      path="/setting/security-privacy"
                      component={SettingSecurityPrivacyPage}
                    />
                    <Route path="/sign" component={SignPage} />
                    <Route
                      path="/icns/adr36-signatures"
                      component={ICNSAdr36SignPage}
                    />
                    <Route
                      path="/suggest-chain"
                      component={ChainSuggestedPage}
                    />
                    <Route
                      path="/permissions/grant/get-chain-infos"
                      component={GrantGlobalPermissionGetChainInfosPage}
                    />
                    <Route
                      path="/setting/permissions/get-chain-infos"
                      component={SettingPermissionsGetChainInfosPage}
                    />
                    <Route
                      path="/setting/chain-active"
                      component={ChainActivePage}
                    />
                    <Route path="/authz" component={AuthZPage} />
                    <Route
                      exact
                      path="/notification"
                      component={NotificationPage}
                    />
                    <Route
                      exact
                      path="/notification/organisations/:type"
                      component={NotificationOrganizations}
                    />
                    <Route
                      exact
                      path="/notification/topics/:type"
                      component={NotificationTopics}
                    />
                    <Route
                      exact
                      path="/notification/review"
                      component={ReviewNotification}
                    />
                    <Route exact path="/chat" component={ChatPage} />
                    <Route exact path="/chat/:name" component={ChatSection} />
                    <Route exact path="/new-chat" component={NewChat} />
                    <Route
                      exact
                      path="/chat/group-chat/create"
                      component={CreateGroupChat}
                    />
                    <Route
                      exact
                      path="/chat/group-chat/add-member"
                      component={AddMember}
                    />
                    <Route
                      exact
                      path="/chat/group-chat/edit-member"
                      component={EditMember}
                    />
                    <Route
                      exact
                      path="/chat/group-chat/review-details"
                      component={ReviewGroupChat}
                    />
                    <Route
                      exact
                      path="/chat/group-chat-section/:name"
                      component={GroupChatSection}
                    />
                    <Route
                      exact
                      path="/chat/agent/:name"
                      component={AgentChatSection}
                    />
                    <Route exact path="/more" component={MorePage} />
                    <Route
                      exact
                      path="/setting/notifications"
                      component={SettingNotifications}
                    />
                    <Route
                      exact
                      path="/setting/chat"
                      component={ChatSettings}
                    />
                    <Route
                      exact
                      path="/setting/chat/block"
                      component={BlockList}
                    />
                    <Route
                      exact
                      path="/setting/chat/privacy"
                      component={Privacy}
                    />
                    <Route
                      exact
                      path="/setting/chat/readRecipt"
                      component={ReadRecipt}
                    />
                    <Route exact path="/validators" component={ValidatorList} />
                    <Route
                      exact
                      path="/validators/:validator_address/:operation"
                      component={Validator}
                    />
                    <Route
                      exact
                      path="/stake-complete/:validator_address"
                      component={StakeComplete}
                    />
                    <Route path="*" component={StateRenderer} />
                  </Switch>
                </ChatStoreProvider>
              </HashRouter>
            </ConfirmProvider>
          </NotificationProvider>
        </NotificationStoreProvider>
      </LoadingIndicatorProvider>
    </AppIntlProvider>
  </StoreProvider>,
  document.getElementById("app")
);
