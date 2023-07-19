import React, { useState } from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";
import { getDomainPrice, mintDomain } from "../../../name-service/fns-apis";
import { formatDomain, shortenMintingNumber } from "@utils/format";

type MintProps = {
  domainPrice: any;
  domainName: string;
  setError: (value: boolean) => void;
  setShowCard: (value: boolean) => void;
};

interface DomainPriceResponse {
  result: {
    Success: {
      pricing: {
        amount: string;
        denom: string;
      };
    };
  };
}

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

  const [showPopUp, setShowPopUp] = useState(false);
  const [continueMinting, setContinueMinting] = useState(true);
  const [mintingPrice, setmintingPrice] = useState("");

  const handleMintButtonClick = async () => {
    const fetchPrice = async () => {
      try {
        const price = await getDomainPrice(current.chainId, domainName);
        const priceResponse = price as DomainPriceResponse;

        if (priceResponse.result?.Success) {
          const priceDenom = priceResponse.result.Success.pricing;
          const shorten = shortenMintingNumber(
            priceDenom.amount.toString(),
            18
          );
          setmintingPrice(`${shorten} FET`);
          console.log(shorten);
        } else {
          setmintingPrice("Not Available");
        }
      } catch (error) {
        console.error("Error fetching domain price:", error);
        setmintingPrice("Not Available");
      }
    };
    fetchPrice();
    setShowPopUp(true);
  };

  const handleContinueButtonClick = async () => {
    try {
      if (continueMinting) {
        await mintDomain(
          current.chainId,
          account,
          domainName,
          domainPrice.result.Success.pricing
        );
        history.push("/fetch-name-service");
      }
      setShowPopUp(false);
    } catch (error) {
      console.error("Error minting domain:", error);
      setError(true);
      setShowCard(true);
      setShowPopUp(false);
    }
  };

  const handleCancelButtonClick = () => {
    setShowPopUp(false);
    setContinueMinting(false);
  };

  return (
    <>
      <button
        className={style.mint}
        color="primary"
        onClick={handleMintButtonClick}
      >
        MINT{" "}
        <span className={style.domainName}>{formatDomain(domainName)}</span>
      </button>

      {showPopUp && (
        <div className={style.popupCard}>
          <div style={{ fontSize: "small" }}>
            <div>Confirmation for {formatDomain(domainName)}</div>
            Price of minting is : {mintingPrice} <br />
            <div style={{ display: "flex", marginRight: "5px" }}>
              <button onClick={handleContinueButtonClick}>Continue</button>
              <button onClick={handleCancelButtonClick}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
