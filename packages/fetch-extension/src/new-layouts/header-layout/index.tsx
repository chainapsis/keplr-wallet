import React, { CSSProperties, FunctionComponent, useState } from "react";

import { MenuProvider, MenuContext } from "../menu";

import { Header, Props as HeaderProps } from "../header";
import { BottomNav } from "../bottom-nav";

import style from "./style.module.scss";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props extends HeaderProps {
  style?: CSSProperties;
  innerStyle?: CSSProperties;
  showBottomMenu?: boolean;
}

export const HeaderLayout: FunctionComponent<Props> = (props) => {
  const { children } = props;

  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuContext: MenuContext = {
    open: () => {
      setMenuOpen(true);
    },
    close: () => {
      setMenuOpen(false);
    },
    toggle: () => {
      setMenuOpen(!isMenuOpen);
    },
  };

  return (
    <MenuProvider value={menuContext}>
      <div className={style["container"]} style={props.style}>
        <div className={style["bgBiur"]}>
          <div className={style["bgBiurChild"]} />
          <div className={style["bgBiurItem"]} />
        </div>
        <Header {...props} isMenuOpen={isMenuOpen} />
        <div className={style["innerContainer"]} style={props.innerStyle}>
          {children}
        </div>

        {(props.showBottomMenu ?? true) && <BottomNav />}
      </div>
    </MenuProvider>
  );
};
