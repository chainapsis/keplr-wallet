import { HeaderLayout } from "@layouts-v2/header-layout";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import style from "./style.module.scss";
import { LineGraphView } from "../../components-v2/line-graph";
import { ButtonV2 } from "@components-v2/buttons/button";
import { getTokenIcon } from "@utils/get-token-icon";
import { Activity } from "./activity";
import { observer } from "mobx-react-lite";
import { separateNumericAndDenom } from "@utils/format";

export const AssetView = observer(() => {
  const location = useLocation();
  const [tokenInfo, setTokenInfo] = useState<any>();
  const [tokenIcon, setTokenIcon] = useState<string>("");

  const [balances, setBalances] = useState<any>();
  const [assetValues, setAssetValues] = useState<any>();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenInfoString = searchParams.get("tokenDetails");
    const balancesString = searchParams.get("balance");
    if (balancesString) {
      const decodedBalancesString = JSON.parse(
        decodeURIComponent(balancesString)
      );
      const balances: any = decodedBalancesString;
      setBalances(balances);
    }

    if (tokenInfoString) {
      const decodedTokenInfo = JSON.parse(decodeURIComponent(tokenInfoString));
      const tokenInfo: any = decodedTokenInfo;
      setTokenInfo(tokenInfo);
    }
  }, [location.search]);
  useEffect(() => {
    const fetchTokenImage = async () => {
      const tokenImage = await getTokenIcon(tokenInfo?.coinGeckoId);
      setTokenIcon(tokenImage);
    };
    fetchTokenImage();
  }, [tokenInfo?.coinGeckoId]);
  const { numericPart: totalNumber, denomPart: totalDenom } =
    separateNumericAndDenom(balances?.balance.toString());

  let changeInDollarsClass = null;
  if (assetValues) {
    changeInDollarsClass =
      assetValues?.type === "positive"
        ? style["increaseInDollarsGreen"]
        : style["increaseInDollarsOrange"];
  }

  let changeInDollarsValue = null;
  if (assetValues) {
    changeInDollarsValue =
      assetValues?.type === "positive"
        ? (parseFloat(totalNumber) * assetValues.diff) / 100
        : -(parseFloat(totalNumber) * assetValues.diff) / 100;
  }

  return (
    <HeaderLayout showTopMenu={true} onBackButton={() => navigate(-1)}>
      <div className={style["asset-info"]}>
        {tokenIcon ? (
          <img className={style["icon"]} src={tokenIcon} alt="" />
        ) : (
          <div className={style["icon"]}>
            {tokenInfo?.coinDenom[0].toUpperCase()}
          </div>
        )}
        <div className={style["name"]}>{tokenInfo?.coinDenom}</div>
        <div className={style["price-in-usd"]}>
          {balances?.balanceInUsd ? `${balances?.balanceInUsd} USD` : "0 USD"}
        </div>

        {assetValues?.diff && (
          <div
            className={` ${
              assetValues.type === "positive"
                ? style["priceChangesGreen"]
                : style["priceChangesOrange"]
            }`}
          >
            <div
              className={style["changeInDollars"] + " " + changeInDollarsClass}
            >
              {changeInDollarsValue !== null && changeInDollarsValue.toFixed(4)}{" "}
              {totalDenom}
            </div>
            <div className={style["changeInPer"]}>
              ( {assetValues.type === "positive" ? "+" : "-"}
              {parseFloat(assetValues.diff).toFixed(2)} %)
            </div>
            <div className={style["day"]}>{assetValues.time}</div>
          </div>
        )}
      </div>
      {tokenInfo?.coinGeckoId && (
        <LineGraphView
          tokenName={tokenInfo?.coinGeckoId}
          setTokenState={setAssetValues}
          tokenState={assetValues}
        />
      )}
      <div className={style["balances"]}>
        <div className={style["your-bal"]}>YOUR BALANCE</div>
        <div>
          <div className={style["balance-field"]}>
            <div className={style["balance"]}>
              {totalNumber} <div className={style["denom"]}>{totalDenom}</div>
            </div>
            <div className={style["inUsd"]}>
              {balances?.balanceInUsd
                ? `${balances?.balanceInUsd} USD`
                : "0 USD"}{" "}
            </div>
          </div>
        </div>
        <div />
      </div>
      <div>
        <div style={{ display: "flex", gap: "12px" }}>
          <ButtonV2
            styleProps={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              justifyContent: "center",
            }}
            onClick={() => navigate("/receive")}
            text={"Receive"}
          >
            <img
              className={style["img"]}
              src={require("@assets/svg/wireframe/arrow-down-gradient.svg")}
              alt=""
            />
          </ButtonV2>
          <ButtonV2
            styleProps={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              justifyContent: "center",
            }}
            onClick={() => navigate("/send")}
            text={"Send"}
          >
            <img
              className={style["img"]}
              src={require("@assets/svg/wireframe/arrow-up-gradient.svg")}
              alt=""
            />
          </ButtonV2>
        </div>
        {tokenInfo?.coinDenom === "FET" && (
          <ButtonV2
            styleProps={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              justifyContent: "center",
              marginBottom: "48px",
            }}
            onClick={() => navigate("/validators/validator")}
            text={"Stake"}
          >
            <img
              className={style["img"]}
              src={require("@assets/svg/wireframe/earn.svg")}
              alt=""
            />
          </ButtonV2>
        )}
      </div>
      <Activity token={tokenInfo?.coinDenom} />
    </HeaderLayout>
  );
});
