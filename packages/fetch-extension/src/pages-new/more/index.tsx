import { HeaderLayout } from "@layouts-v2/header-layout";
import React, { FunctionComponent } from "react";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { CHAINS } from "../../config.axl-brdige.var";
import { Card } from "@components-v2/card";
import { useNavigate } from "react-router";

export const MorePage: FunctionComponent = () => {
  const { chainStore, analyticsStore, keyRingStore } = useStore();
  const navigate = useNavigate();
  const isAxlViewVisible = CHAINS.some((chain) => {
    return chain.chainId?.toString() === chainStore.current.chainId;
  });
  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  return (
    <HeaderLayout
      innerStyle={{
        marginTop: "0px",
        marginBottom: "0px",
      }}
      showChainName={true}
      canChangeChainInfo={true}
      showBottomMenu={true}
    >
      <div className={style["title"]}>More</div>
      <div className={style["subTitle"]}>Account</div>
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/currency.svg")}
        heading={"Currency"}
        onClick={() => navigate("/more/currency")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/manage-tokens.svg")}
        heading={"Manage Tokens"}
        onClick={() => navigate("/more/token/manage")}
      />
      <Card
        leftImageStyle={{ background: "transparent", height: "18px" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/at.svg")}
        heading={"Address Book"}
        onClick={() => navigate("/more/address-book")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/language.svg")}
        heading={"Language"}
        onClick={() => navigate("/more/language")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/notification.svg")}
        heading={"Notifications"}
        onClick={() => navigate("/more/notifications")}
      />
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "6px" }}
        leftImage={require("@assets/svg/wireframe/security.svg")}
        heading={"Security & privacy"}
        onClick={() => navigate("/more/security-privacy")}
      />

      <div
        style={{
          marginTop: "12px",
        }}
        className={style["subTitle"]}
      >
        Others
      </div>
      <Card
        leftImageStyle={{ background: "transparent", height: "16px" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
        leftImage={require("@assets/svg/wireframe/ibc-transfer-v2.svg")}
        heading={"IBC Transfer"}
        onClick={(e: any) => {
          e.preventDefault();
          analyticsStore.logEvent("ibc_transfer_click", {
            pageName: "More Tab",
          });
          navigate("/ibc-transfer");
        }}
      />
      {chainStore.current.govUrl && (
        <Card
          leftImageStyle={{ background: "transparent" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImage={require("@assets/svg/wireframe/proposal.svg")}
          heading={"Proposals"}
          onClick={(e: any) => {
            e.preventDefault();
            analyticsStore.logEvent("proposal_view_click");
            navigate("/proposal");
          }}
        />
      )}
      <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
        leftImage={require("@assets/svg/wireframe/guide.svg")}
        heading={"Guide"}
        onClick={() =>
          window.open(
            "https://fetch.ai/docs/guides/fetch-network/fetch-wallet/fetch-wallet-getting-started",
            "_blank"
          )
        }
      />
      {(chainStore.current.chainId === "fetchhub-4" ||
        chainStore.current.chainId === "dorado-1") && (
        <Card
          leftImageStyle={{ background: "transparent" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImage={require("@assets/svg/wireframe/fns.svg")}
          heading={".FET Domains"}
          onClick={() => navigate("/fetch-name-service/explore")}
        />
      )}
      {isAxlViewVisible && (
        <Card
          leftImageStyle={{ background: "transparent" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImage={require("@assets/svg/wireframe/axl-bridge.svg")}
          heading={"Axelar Bridge"}
          onClick={() =>
            isEvm ? navigate("/axl-bridge-evm") : navigate("/axl-bridge-cosmos")
          }
        />
      )}
      {/* <Card
        leftImageStyle={{ background: "transparent" }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "5px" }}
        leftImage={require("@assets/svg/wireframe/wallet-version.svg")}
        heading={"Fetch Wallet version"}
        onClick={() => navigate("/app-version")}
      /> */}

      <Card
        leftImageStyle={{
          background: "transparent",
          height: "16px",
          width: "24px",
        }}
        style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
        leftImage={require("@assets/svg/wireframe/sign-out.svg")}
        heading={"Sign out"}
        onClick={() => {
          keyRingStore.lock();
          analyticsStore.logEvent("sign_out_click");
          navigate("/");
        }}
      />
      <div
        style={{
          marginBottom: "20px",
        }}
      />
    </HeaderLayout>
  );
};
