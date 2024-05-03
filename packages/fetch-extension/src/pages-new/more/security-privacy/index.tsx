import React, { FunctionComponent, useEffect, useState } from "react";
import style from "../style.module.scss";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { useStore } from "../../../stores";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { Card } from "@components-v2/card";

export const SecurityPrivacyPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { analyticsStore, keyRingStore } = useStore();
  const [accountIndex, setAccountIndex] = useState<number>(0);

  const intl = useIntl();

  useEffect(() => {
    const firstAccountIndex = keyRingStore.multiKeyStoreInfo.findIndex(
      (value) => value.selected
    );
    setAccountIndex(firstAccountIndex);
  }, [keyRingStore.multiKeyStoreInfo]);
  return (
    <HeaderLayout
      showTopMenu={true}
      smallTitle={true}
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.security-privacy",
      })}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Security & Privacy",
        });
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <Card
          style={{
            background: "rgba(255,255,255,0.1)",
            marginBottom: "8px",
            height: "69px",
          }}
          leftImageStyle={{ background: "transparent" }}
          leftImage={require("@assets/svg/wireframe/key.svg")}
          heading={"View mnemonic seed"}
          onClick={() => {
            navigate(`/more/export/${accountIndex}`);
            analyticsStore.logEvent("wallet_access_permissions_click", {
              pageName: "Security & Privacy",
            });
          }}
        />
        <Card
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImageStyle={{ background: "transparent" }}
          leftImage={require("@assets/svg/wireframe/wallet-access-permission.svg")}
          heading={intl.formatMessage({
            id: "setting.connections",
          })}
          subheading={intl.formatMessage({
            id: "setting.connections.paragraph",
          })}
          onClick={() => {
            navigate("/more/security-privacy/connections");
            analyticsStore.logEvent("wallet_access_permissions_click", {
              pageName: "Security & Privacy",
            });
          }}
        />
        <Card
          leftImage={require("@assets/svg/wireframe/chain-list-access.svg")}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImageStyle={{ background: "transparent" }}
          heading={intl.formatMessage({
            id: "setting.permissions.get-chain-infos",
          })}
          subheading={intl.formatMessage({
            id: "setting.permissions.get-chain-infos.paragraph",
          })}
          onClick={() => {
            navigate("/more/permissions/get-chain-infos");
            analyticsStore.logEvent("chain_list_access_click", {
              pageName: "Security & Privacy",
            });
          }}
        />
        <Card
          leftImage={require("@assets/svg/wireframe/auto-lock-timer.svg")}
          style={{ background: "rgba(255,255,255,0.1)", height: "69px" }}
          leftImageStyle={{ background: "transparent" }}
          heading={intl.formatMessage({
            id: "setting.autolock",
          })}
          onClick={() => {
            navigate("/more/security-privacy/autolock");
            analyticsStore.logEvent("auto_lock_timer_click", {
              pageName: "Security & Privacy",
            });
          }}
        />
      </div>
    </HeaderLayout>
  );
};
