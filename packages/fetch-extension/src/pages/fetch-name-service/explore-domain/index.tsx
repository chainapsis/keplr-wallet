import allMintedDomainImage from "@assets/icon/all-minted-domain.png";
import collectionsImage from "@assets/icon/collections.png";
import React from "react";
import { SearchInput } from "./search-input";
import style from "./style.module.scss";
export const ExploreDomain = () => {
  return (
    <React.Fragment>
      <div className={style["content"]}>
        Your all inclusive <br />{" "}
        <div className={style["gradientContent"]}>
          decentralized naming system
        </div>
      </div>
      <SearchInput />
      <div
        style={{
          position: "absolute",
          bottom: "47px",
          width: 320,
          right: "21px",
        }}
      >
        <a
          href="https://www.fetns.domains/market"
          target="_blank"
          rel="noreferrer"
          className={style["moreDetails"]}
        >
          <img src={allMintedDomainImage} alt="" draggable={false} />
          <img
            className={style["arrowIcon"]}
            src={require("@assets/svg/arrow-right-outline.svg")}
            alt=""
            draggable={false}
          />
        </a>
        <div className={style["border"]} />
        <a
          href="https://www.fetns.domains/collections"
          target="_blank"
          rel="noreferrer"
          className={style["moreDetails"]}
        >
          <img src={collectionsImage} alt="" draggable={false} />
          <img
            className={style["arrowIcon"]}
            src={require("@assets/svg/arrow-right-outline.svg")}
            alt=""
            draggable={false}
          />
        </a>
      </div>
    </React.Fragment>
  );
};
