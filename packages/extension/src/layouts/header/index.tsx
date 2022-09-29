import React, { FunctionComponent, ReactNode } from "react";

import { Header as CompHeader } from "../../components/header";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import style from "./style.module.scss";
import { ToolTip } from "../../components/tooltip";

import { ChainList } from "./chain-list";
import { Menu, useMenu, MenuButton } from "../menu";

import { motion } from "framer-motion";

export interface Props {
  showChainName: boolean;
  canChangeChainInfo: boolean;

  alternativeTitle?: string;
  menuRenderer?: ReactNode;
  rightRenderer?: ReactNode;
  onBackButton?: () => void;
}

export interface LocalProps {
  isMenuOpen: boolean;
}

export const Header: FunctionComponent<Props & LocalProps> = observer(
  ({
    showChainName,
    canChangeChainInfo,
    alternativeTitle,
    menuRenderer,
    rightRenderer,
    isMenuOpen,
    onBackButton,
  }) => {
    const { chainStore } = useStore();
    const menu = useMenu();

    const chainInfoChangable =
      canChangeChainInfo &&
      chainStore.chainInfos.length > 1 &&
      alternativeTitle == null;

    return (
      <CompHeader
        left={
          <div className={style.menuContainer}>
            {menuRenderer ? (
              <React.Fragment>
                <Menu isOpen={isMenuOpen}>{menuRenderer}</Menu>
                <motion.div
                  className={style["menu-img"]}
                  style={{ zIndex: 901 }}
                  animate={isMenuOpen ? "open" : "closed"}
                  onClick={menu.toggle}
                >
                  <MenuButton />
                </motion.div>
              </React.Fragment>
            ) : null}
            {onBackButton ? (
              <div
                className={style["menu-img"]}
                onClick={() => {
                  if (onBackButton) {
                    onBackButton();
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path
                    fill="transparent"
                    strokeWidth="2"
                    stroke="hsl(0, 0%, 18%)"
                    strokeLinecap="round"
                    d="M 6.5 10 L 13.5 3.5 M 6.5 10 L 13.5 16.5"
                  />
                </svg>
              </div>
            ) : null}
          </div>
        }
        right={rightRenderer}
      >
        {showChainName || alternativeTitle ? (
          <ToolTip
            trigger={chainInfoChangable ? "click" : "static"}
            tooltip={<ChainList />}
          >
            <div
              className={style.chainListContainer}
              style={{ cursor: chainInfoChangable ? undefined : "default" }}
            >
              <div className={style.title}>
                {showChainName
                  ? chainStore.current.chainName
                  : alternativeTitle}
              </div>

              {chainInfoChangable ? (
                <div className={style.titleIconContainer}>
                  <svg
                    className={style.titleIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z" />
                  </svg>
                </div>
              ) : null}
            </div>
          </ToolTip>
        ) : null}
      </CompHeader>
    );
  }
);
