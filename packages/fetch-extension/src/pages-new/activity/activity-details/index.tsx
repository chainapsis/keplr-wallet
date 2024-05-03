import { HeaderLayout } from "@layouts-v2/header-layout";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import style from "./style.module.scss";
import moment from "moment";
import { Card } from "@components-v2/card";
import { useStore } from "../../../stores";
import { formatAddress } from "@utils/format";
import { useLanguage } from "../../../languages";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import { DetailRows } from "./detail-rows";

export const ActivityDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const language = useLanguage();
  const details = location.state.details || {};
  const [usdValue, setUsdValue] = useState<any>("$0");
  const { priceStore } = useStore();
  const fiatCurrency = language.fiatCurrency;
  const convertTofiatCurrency = (currency: any) => {
    const value = priceStore.calculatePrice(currency, fiatCurrency);
    const inUsd = value && value.shrink(true).maxDecimals(6).toString();
    return inUsd;
  };
  const currency: AppCurrency = {
    coinDenom: "FET",
    coinMinimalDenom: "afet",
    coinDecimals: 18,
    coinGeckoId: "fetch-ai",
  };

  useEffect(() => {
    if (details.amt) {
      const amountInNumber = parseFloat(
        details.amt.amount ? details.amt.amount : details.amt[0].amount
      );
      const inputValue = new CoinPretty(currency, new Int(amountInNumber));
      const inputValueInUsd = convertTofiatCurrency(inputValue);
      setUsdValue(inputValueInUsd);
    }
  }, []);

  const verbs = ["Redelegated", "Staked", "Unstaked", "Claimed"];
  const toAddress = (details: any) => {
    switch (true) {
      case Boolean(details.toAddress):
        return formatAddress(details.toAddress);
      case Boolean(details.validatorAddress):
        return formatAddress(details.validatorAddress);
      case Boolean(details.validatorDstAddress):
        return formatAddress(details.validatorDstAddress);
      case details.verb == "IBC transfer":
        return formatAddress(details.receiver);
      default:
        return null;
    }
  };

  return (
    <HeaderLayout
      onBackButton={() => navigate(-1)}
      showTopMenu={true}
      alternativeTitle=""
    >
      <div className={style["topBar"]}>
        <img src={require("@assets/svg/wireframe/fetch-logo.svg")} alt="verb" />
        <div className={style["verb"]}>{details.verb}</div>
        <div className={style["time"]}>
          {moment(details.timestamp).utc().format("ddd, DD MMM YYYY hh:mm A")}
        </div>
      </div>

      <div className={style["card"]}>
        {details.verb == "Smart Contract Interaction" ? (
          <Card
            leftImage={require("@assets/svg/wireframe/contract-interaction.svg")}
            style={{ background: "transparent", width: "100%", height: "69px" }}
            heading={"Smart Contract"}
            rightContent={
              <div className={style["cardAmt"]}>
                <div className={style["inFET"]}>
                  {`${details.amountNumber} ${details.amountAlphabetic}`}
                </div>
                {usdValue && <div className={style["inUSD"]}>{usdValue}</div>}
              </div>
            }
          />
        ) : (
          <React.Fragment>
            <Card
              leftImage={
                verbs.includes(details.verb)
                  ? require("@assets/svg/wireframe/stake-v2.svg")
                  : require("@assets/svg/wireframe/wallet.svg")
              }
              style={{ background: "transparent" }}
              heading={details.signerAddress ? "From" : "deligator address"}
              subheading={formatAddress(
                details.signerAddress
                  ? details.signerAddress
                  : details.deligatorAddress
              )}
            />
            <div className={style["verticalLine"]} />
            <Card
              leftImage={
                verbs.includes(details.verb)
                  ? require("@assets/svg/wireframe/stake-v2.svg")
                  : require("@assets/svg/wireframe/wallet.svg")
              }
              style={{ background: "transparent", width: "337px" }}
              heading={
                details.toAddress
                  ? "To"
                  : details.verb == "IBC transfer"
                  ? "Receiver"
                  : "Validator address"
              }
              subheading={toAddress(details)}
              rightContent={
                <div className={style["cardAmt"]}>
                  <div
                    className={style["inFET"]}
                    style={
                      details.verb == "Received"
                        ? {
                            color:
                              "var(--Green-Green-500---Vibrant-green, #2DE376)",
                          }
                        : {}
                    }
                  >
                    {`${details.amountNumber} ${details.amountAlphabetic}`}
                  </div>
                  {usdValue != "$0" && (
                    <div className={style["inUSD"]}>{usdValue}</div>
                  )}
                </div>
              }
            />
          </React.Fragment>
        )}
      </div>
      <DetailRows details={details} />
    </HeaderLayout>
  );
};
