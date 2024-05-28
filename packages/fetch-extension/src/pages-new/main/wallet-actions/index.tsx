import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { Card } from "@components-v2/card";
import style from "./style.module.scss";
import { Dropdown } from "@components-v2/dropdown";

interface WalletActionsProps {
  isOpen: boolean;
  setIsOpen: any;
}
export const WalletActions: React.FC<WalletActionsProps> = observer(
  ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const { accountStore, chainStore, queriesStore } = useStore();
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);
    const queryBalances = queries.queryBalances.getQueryBech32Address(
      accountInfo.bech32Address
    );
    const hasAssets =
      queryBalances.balances.find((bal) =>
        bal.balance.toDec().gt(new Dec(0))
      ) !== undefined;

    const stakable = queries.queryBalances.getQueryBech32Address(
      accountInfo.bech32Address
    ).stakable;
    const isStakableExist = useMemo(() => {
      return stakable.balance.toDec().gt(new Dec(0));
    }, [stakable.balance]);
    console.log(isStakableExist);

    return (
      <div className={style["actions"]}>
        <Dropdown
          styleProp={{ color: "transparent" }}
          title={"_"}
          closeClicked={() => !isOpen}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        >
          <Card
            leftImageStyle={{ background: "transparent", height: "16px" }}
            style={{
              background: "rgba(255,255,255,0.1)",
              height: "60px",
              marginBottom: "6px",
            }}
            leftImage={require("@assets/svg/wireframe/arrow-up.svg")}
            heading={"Send"}
            onClick={() => navigate("/send")}
          />
          <Card
            leftImageStyle={{ background: "transparent", height: "16px" }}
            style={{
              background: "rgba(255,255,255,0.1)",
              height: "60px",
              marginBottom: "6px",
            }}
            leftImage={require("@assets/svg/wireframe/arrow-down.svg")}
            heading={"Receive"}
            onClick={() => {
              if (hasAssets) {
                navigate("/receive");
              }
            }}
          />

          <Card
            leftImageStyle={{ background: "transparent", height: "22px" }}
            style={{
              background: "rgba(255,255,255,0.1)",
              height: "60px",
              marginBottom: "6px",
            }}
            leftImage={require("@assets/svg/wireframe/bridge.svg")}
            heading={"Bridge"}
            onClick={() => {
              navigate("/bridge");
            }}
          />
        </Dropdown>
      </div>
    );
  }
);
