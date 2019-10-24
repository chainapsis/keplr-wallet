import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";

import { HashRouter, Route, RouteComponentProps } from "react-router-dom";

import { Sidebar } from "./components/sidebar";

import { StoreProvider, useStore } from "./stores";

import "./styles/global.scss";
import { Header } from "./components/header";
import { observer } from "mobx-react";
import { configure } from "mobx";
import {
  NotificationProvider,
  NotificationStoreProvider
} from "../components/notification";

configure({
  enforceActions: "always" // Make mobx to strict mode.
});

const Wallet: FunctionComponent<
  RouteComponentProps<{ chainId: string; path?: string }>
> = observer(props => {
  const { chainStore, walletUIStore } = useStore();
  const { match } = props;
  chainStore.setChain(match.params.chainId);
  walletUIStore.setPath(match.params.path);

  if (!walletUIStore.currentMenu) {
    throw new Error("Invalid url");
  }

  const Section = walletUIStore.currentMenu.sectionRender;

  return (
    <div className="columns is-gapless" style={{ height: "100%" }}>
      <div className="column is-2-widescreen is-3">
        <Sidebar>
          {walletUIStore.walletUI.menus.map((menu, i) => {
            const MenuItem = menu.menuItemRender;
            const to = `/${walletUIStore.walletUI.chainId}${
              menu.path ? `/${menu.path}` : ""
            }`;
            return (
              <MenuItem
                active={walletUIStore.path === menu.path}
                to={to}
                key={i.toString()}
              />
            );
          })}
        </Sidebar>
      </div>
      <div className="column is-8-widescreen is-9">
        <Header />
        <div>
          <Section />
        </div>
      </div>
    </div>
  );
});

const Router: FunctionComponent = () => {
  return (
    <HashRouter>
      <Route path="/:chainId/:path" component={Wallet} />
      <Route path="/:chainId" exact component={Wallet} />
    </HashRouter>
  );
};

ReactDOM.render(
  <StoreProvider>
    <NotificationStoreProvider>
      <NotificationProvider>
        <Router />
      </NotificationProvider>
    </NotificationStoreProvider>
  </StoreProvider>,
  document.getElementById("app")
);
