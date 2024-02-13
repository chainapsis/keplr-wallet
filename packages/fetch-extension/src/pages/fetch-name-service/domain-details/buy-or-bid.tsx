import React from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";

interface BuyOrBidProps {
  domainName: string;
}

export const BuyOrBid: React.FC<BuyOrBidProps> = ({ domainName }) => {
  const { analyticsStore } = useStore();
  const handleClick = () => {
    const url = `https://www.fetns.domains/domains/${domainName}`;
    window.open(url, "_blank");
  };

  return (
    <div className={style["buttonGroup"]}>
      <button
        className={style["mint"]}
        style={{
          marginRight: "10px",
          backgroundColor: "#1c0032",
          border: "1px solid #9075ff",
        }}
        onClick={() => {
          analyticsStore.logEvent("fns_buy_now_button_click");
          handleClick();
        }}
      >
        <span className={style["domainName"]}>Buy Now</span>
      </button>
      <button
        className={style["mint"]}
        onClick={() => {
          analyticsStore.logEvent("fns_make_an_offer_button_click");
          handleClick();
        }}
      >
        <span className={style["domainName"]}>Make An Offer</span>
      </button>
    </div>
  );
};
