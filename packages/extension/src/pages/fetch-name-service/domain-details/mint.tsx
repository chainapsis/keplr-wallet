import React from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";
import { mintDomain } from "../../../name-service/fns-apis";
import { formatDomain } from "@utils/format";

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
  const handleMintButtonClick = async () => {
    try {
      await mintDomain(
        current.chainId,
        account,
        domainName,
        domainPrice.result.Success.pricing
      );
      history.push("/fetch-name-service");
    } catch (error) {
      console.error("Error minting domain:", error);
      setError(true);
      setShowCard(true);
    }
  };

  return (
    <button
      className={style.mint}
      color="primary"
      onClick={handleMintButtonClick}
    >
      MINT <span className={style.domainName}>{formatDomain(domainName)}</span>
    </button>
  );
};
