import allMintedDomainImage from "@assets/icon/all-minted-domain.png";
import collectionsImage from "@assets/icon/collections.png";
import React from "react";
import { SearchInput } from "./search-input";
import style from "./style.module.scss";
export const ExploreDomain = () => {
  return (
    <React.Fragment>
      <div className={style.content}>
        Your all inclusive <br />{" "}
        <div className={style.gradientContent}>decentralized naming system</div>
      </div>
      <SearchInput />
      <a
        href="https://www.fetns.domains/market"
        target="_blank"
        rel="noreferrer"
        className={style.moreDetails}
      >
        <img src={allMintedDomainImage} alt="" />
        <img
          className={style.arrowIcon}
          src={require("@assets/svg/arrow-right-outline.svg")}
          alt=""
        />
      </a>
      <div className={style.border} />
      <a
        href="https://www.fetns.domains/collections"
        target="_blank"
        rel="noreferrer"
        className={style.moreDetails}
      >
        <img src={collectionsImage} alt="" />
        <img
          className={style.arrowIcon}
          src={require("@assets/svg/arrow-right-outline.svg")}
          alt=""
        />
      </a>
    </React.Fragment>
  );
};
