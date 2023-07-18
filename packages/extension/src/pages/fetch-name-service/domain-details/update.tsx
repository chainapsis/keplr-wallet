import React from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
import { setPrimary, updateDomain } from "../../../name-service/fns-apis";
import { useHistory } from "react-router";

interface UpdateProps {
  domainPrice: any;
  domainName: string;
  domainData: any;
}

export const Update: React.FC<UpdateProps> = ({
  domainPrice,
  domainName,
  domainData,
}) => {
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const account = accountStore.getAccount(current.chainId);
  const history = useHistory();

  const handleMakePrimary = async () => {
    try {
      await setPrimary(
        current.chainId,
        account,
        domainName,
        domainPrice.result.Success.pricing
      );
      history.push("/fetch-name-service");
    } catch (error) {
      console.error("Error making domain as primary:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDomain(
        current.chainId,
        account,
        domainName,
        domainData,
        domainPrice.result.Success.pricing
      );
      history.push("/fetch-name-service");
    } catch (error) {
      console.error("Error making domain as primary:", error);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <button
        disabled
        className={style.mint}
        style={{
          marginRight: "10px",
          background: "transparent",
          border: "1px solid #9075ff",
        }}
        onClick={handleMakePrimary}
      >
        <span className={style.domainName}>Make Primary</span>
      </button>
      <button disabled className={style.mint} onClick={handleUpdate}>
        <span className={style.domainName}>Update</span>
      </button>
    </div>
  );
};
