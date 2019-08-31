import React from "react";

import { Header as CompHeader } from "../../../components/header";

import style from "./style.scss";

export class Header extends React.Component {
  render() {
    return (
      <CompHeader
        left={
          <div className={style.menuContainer}>
            <svg
              className={style["menu-img"]}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M432 176H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h352c8.8 0 16 7.2 16 16s-7.2 16-16 16zM432 272H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h352c8.8 0 16 7.2 16 16s-7.2 16-16 16zM432 368H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h352c8.8 0 16 7.2 16 16s-7.2 16-16 16z" />
            </svg>
          </div>
        }
      >
        <div className={style.titleContainer}>
          <div className={style.title}>Cosmos</div>
          <div className={style.titleIconContainer}>
            <svg
              className={style.titleIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z" />
            </svg>
          </div>
        </div>
      </CompHeader>
    );
  }
}
