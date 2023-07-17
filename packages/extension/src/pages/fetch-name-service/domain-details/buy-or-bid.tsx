import React from "react";
import style from "./style.module.scss";

interface BuyOrBidProps {
  domainName: string;
}

export const BuyOrBid: React.FC<BuyOrBidProps> = ({ domainName }) => {
  const handleClick = () => {
    const url = `https://www.fetns.domains/domains/${domainName}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex" }}>
      <button
        className={style.mint}
        style={{
          marginRight: "10px",
          background: "transparent",
          border: "1px solid #9075ff",
        }}
        onClick={handleClick}
      >
        <span className={style.domainName}>Buy Now</span>
      </button>
      <button className={style.mint} onClick={handleClick}>
        <span className={style.domainName}>Make An Offer</span>
      </button>
    </div>
  );
};
