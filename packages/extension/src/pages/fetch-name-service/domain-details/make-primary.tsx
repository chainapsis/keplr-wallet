import React from "react";
import style from "./style.module.scss";
import { setPrimary } from "../../../name-service/fns-apis";
import { useStore } from "../../../stores";
import { useHistory } from "react-router";
type Props = {
  sender: string;
  domainName: string;
  setError: (value: boolean) => void;
  setShowCard: (value: boolean) => void;
};
export const MakePrimary: React.FC<Props> = ({
  domainName,
  setError,
  setShowCard,
}) => {
  const history = useHistory();
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const account = accountStore.getAccount(current.chainId);
  const makePrimary = async () => {
    try {
      await setPrimary(account, domainName);
      history.push("/fetch-name-service");
    } catch (error) {
      console.error("Error making domain as primary:", error);
      setError(true);
      setShowCard(true);
    }
  };
  return (
    <button className={style.mint} onClick={makePrimary} color="primary">
      <span className={style.domainName}>MAKE PRIMARY</span>
    </button>
  );
};
