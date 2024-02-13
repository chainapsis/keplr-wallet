import { useNotification } from "@components/notification";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../../languages";
import { mintDomain } from "../../../name-service/fns-apis";
import { useStore } from "../../../stores";
import { shortenNumber } from "../../activity/native/activity-row";
import { TooltipForDomainNames } from "./index";
import style from "./style.module.scss";
type MintProps = {
  domainPrice: any;
  domainName: string;
};

export const Mint: React.FC<MintProps> = ({ domainPrice, domainName }) => {
  const { chainStore, accountStore, priceStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const account = accountStore.getAccount(current.chainId);
  const navigate = useNavigate();
  const language = useLanguage();
  const fiatCurrency = language.fiatCurrency;
  const notification = useNotification();
  const [isTxnInProgress, setIsTxnInProgress] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [mintingPrice, setmintingPrice] = useState("");

  const getAmount = ({ amount, denom }: { denom: string; amount: string }) => {
    const amountCurrency = chainStore.current.currencies.find(
      (currency: AppCurrency) => currency.coinMinimalDenom === denom
    );

    if (amountCurrency) {
      const amountCoin = new CoinPretty(amountCurrency, amount);
      const amountPrice = priceStore.calculatePrice(amountCoin, fiatCurrency);

      if (amountPrice)
        return `${amountCoin
          .shrink(true)
          .trim(true)
          .maxDecimals(6)
          .toString()} (${amountPrice?.toString()})`;
      else {
        const amountValue = shortenNumber(amount, amountCurrency?.coinDecimals);
        return `${amountValue}${amountCurrency.coinDenom}`;
      }
    } else return `${amount} ${denom}`;
  };

  const handleMintButtonClick = async () => {
    if (domainPrice) {
      const priceDenom = domainPrice;
      const amount = getAmount(priceDenom);
      setmintingPrice(amount);
    } else {
      setmintingPrice("Not Available");
    }

    analyticsStore.logEvent("fns_mint_button_click", {
      chainId: current.chainId,
      chainName: chainStore.current.chainName,
      action: "Cancel",
    });
    setShowPopUp(true);
  };

  const handleContinueButtonClick = async () => {
    setIsTxnInProgress(true);
    try {
      await mintDomain(
        current.chainId,
        account,
        domainName,
        domainPrice,
        notification
      );
      analyticsStore.logEvent("fns_mint_button_click", {
        chainId: current.chainId,
        chainName: chainStore.current.chainName,
        action: "Continue",
      });
    } catch (error) {
      console.error("Error minting domain:", error);
      notification.push({
        placement: "top-center",
        type: "warning",
        duration: 2,
        content: `transaction failed!`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
    navigate(-1);
  };

  const handleCancelButtonClick = () => {
    setShowPopUp(false);
  };

  return (
    <React.Fragment>
      <div className={style["buttonGroup"]}>
        <button
          className={style["mint"]}
          color="primary"
          onClick={handleMintButtonClick}
        >
          <div className={style["mintName"]}>
            MINT
            <div
              className={domainName.length > 15 ? "" : style["domainName"]}
              style={{ color: "purple" }}
            >
              <TooltipForDomainNames domainName={domainName} />
            </div>
          </div>
        </button>
      </div>

      {showPopUp && (
        <div className={style["popupCard"]}>
          <div
            style={{
              display: "flex",
              textAlign: "center",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <div>Price of minting is </div>
            {mintingPrice}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={handleCancelButtonClick}>Cancel</button>
              <button
                className={style["continue"]}
                onClick={handleContinueButtonClick}
                disabled={mintingPrice === "Not Available" || isTxnInProgress}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};
