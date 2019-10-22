import { NativeChainInfos } from "../../chain-info";
import React, { FunctionComponent } from "react";
import { UnderConstructionSection } from "./sections/under-construction";
import { Link } from "react-router-dom";
import classnames from "classnames";

export interface Menu {
  /**
   * The URL is determined by / {chain_id} / {path}.
   * If path is undefined, this menu becomes an index page.
   */
  path?: string;
  menuItemRender: FunctionComponent<{
    active: boolean;
    to: string;
  }>;
  sectionRender: FunctionComponent;
}

export interface WalletUI {
  chainId: string;
  menus: Array<Menu>;
}

/* eslint-disable react/display-name */
export const SupportedChainWalletUIs: WalletUI[] = [
  {
    chainId: "cosmoshub-2",
    menus: [
      {
        menuItemRender: ({ active, to }) => (
          <Link className={classnames({ "is-active": active })} to={to}>
            <i className="fas fa-tachometer-alt" />
            Dashboard
          </Link>
        ),
        sectionRender: () => <UnderConstructionSection />
      },
      {
        path: "send",
        menuItemRender: ({ active, to }) => (
          <Link className={classnames({ "is-active": active })} to={to}>
            <i className="fas fa-exchange-alt" />
            Send
          </Link>
        ),
        sectionRender: () => <UnderConstructionSection />
      },
      {
        path: "stake",
        menuItemRender: ({ active, to }) => (
          <Link className={classnames({ "is-active": active })} to={to}>
            <i className="fas fa-layer-group" />
            Stake
          </Link>
        ),
        sectionRender: () => <UnderConstructionSection />
      },
      {
        path: "governance",
        menuItemRender: ({ active, to }) => (
          <Link className={classnames({ "is-active": active })} to={to}>
            <i className="fas fa-vote-yea" />
            Gorvernance
          </Link>
        ),
        sectionRender: () => <UnderConstructionSection />
      }
    ]
  },
  {
    chainId: "columbus-2",
    menus: [
      {
        menuItemRender: ({ active, to }) => (
          <Link className={classnames({ "is-active": active })} to={to}>
            <i className="fas fa-tachometer-alt" />
            Dashboard
          </Link>
        ),
        sectionRender: () => <UnderConstructionSection />
      },
      {
        path: "send",
        menuItemRender: ({ active, to }) => (
          <Link className={classnames({ "is-active": active })} to={to}>
            <i className="fas fa-exchange-alt" />
            Send
          </Link>
        ),
        sectionRender: () => <UnderConstructionSection />
      },
      {
        path: "stake",
        menuItemRender: ({ active, to }) => (
          <Link className={classnames({ "is-active": active })} to={to}>
            <i className="fas fa-layer-group" />
            Stake
          </Link>
        ),
        sectionRender: () => <UnderConstructionSection />
      }
    ]
  }
];

export const SupportedChainInfos = NativeChainInfos.filter(chainInfo => {
  return SupportedChainWalletUIs.find(walletUI => {
    return walletUI.chainId === chainInfo.chainId;
  });
});
