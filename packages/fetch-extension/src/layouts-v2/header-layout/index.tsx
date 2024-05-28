import React, { CSSProperties, FunctionComponent, useState } from "react";

import { MenuProvider, MenuContext } from "../menu";
import { Header, Props as HeaderProps } from "../header";
import { BottomNav } from "../bottom-nav";
import style from "./style.module.scss";

export interface Props extends HeaderProps {
  style?: CSSProperties;
  innerStyle?: CSSProperties;
  showBottomMenu?: boolean;
  showTopMenu?: boolean;
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

  const headerStyle = {
    paddingTop: props.showTopMenu ? "64px" : "0px",
  };

  return (
    <MenuProvider value={menuContext}>
      <div className={style["container"]} style={props.style}>
        {props.showTopMenu && <Header {...props} isMenuOpen={isMenuOpen} />}
        <div
          style={{ ...headerStyle, ...props.innerStyle }}
          className={
            props.showBottomMenu
              ? style["innerContainerWithMask"]
              : style["innerContainer"]
          }
        >
          {children}
        </div>
        {(props.showBottomMenu ?? true) && <BottomNav />}
      </div>
    </MenuProvider>
  );
};
