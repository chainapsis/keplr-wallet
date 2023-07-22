import React, { useState } from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";
import { mintDomain } from "../../../name-service/fns-apis";
import { AppCurrency } from "@keplr-wallet/types";
import { shortenNumber } from "../../activity/native/activity-row";
import { TooltipForDomainNames } from "./index";
import { useNotification } from "@components/notification";
type MintProps = {
  domainPrice: any;
  domainName: string;
  setError: (value: boolean) => void;
  setShowCard: (value: boolean) => void;
};

export const Mint: React.FC<MintProps> = ({
  domainPrice,
  domainName,
  setError,
  setShowCard,
}) => {
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const account = accountStore.getAccount(current.chainId);
  const history = useHistory();
  const notification = useNotification();

  const [showPopUp, setShowPopUp] = useState(false);
  const [mintingPrice, setmintingPrice] = useState("");

  const getAmount = ({ amount, denom }: { denom: string; amount: string }) => {
    const amountCurrency = chainStore.current.currencies.find(
      (currency: AppCurrency) => currency.coinMinimalDenom === denom
    );
    if (amountCurrency) {
      const amountValue = shortenNumber(amount, amountCurrency?.coinDecimals);

      return `${amountValue}${amountCurrency.coinDenom}`;
    } else return `${amount} ${denom}`;
  };

  const handleMintButtonClick = async () => {
    if (domainPrice.result.Success) {
      const priceDenom = domainPrice.result.Success.pricing;
      const amount = getAmount(priceDenom);
      setmintingPrice(amount);
    } else {
      setmintingPrice("Not Available");
    }

    setShowPopUp(true);
  };

  const handleContinueButtonClick = async () => {
    try {
      await mintDomain(
        current.chainId,
        account,
        domainName,
        domainPrice.result.Success.pricing
      );
      history.push("/fetch-name-service");
      notification.push({
        placement: "top-center",
        type: "primary",
        duration: 2,
        content: `transaction braodcasted!`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    } catch (error) {
      console.error("Error minting domain:", error);
      setError(true);
      setShowCard(true);
      setShowPopUp(false);
    }
  };

  const handleCancelButtonClick = () => {
    setShowPopUp(false);
  };

  return (
    <React.Fragment>
      <div className={style.buttonGroup}>
        <button
          className={style.mint}
          color="primary"
          onClick={handleMintButtonClick}
        >
          MINT
          <span style={{ color: "purple" }}>
            <TooltipForDomainNames domainName={domainName} />
          </span>
        </button>
      </div>

      {showPopUp && (
        <div className={style.popupCard}>
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
              <button
                onClick={handleContinueButtonClick}
                disabled={mintingPrice === "Not Available"}
              >
                Continue
              </button>
              <button onClick={handleCancelButtonClick}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};
