import React from "react";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import * as manifest from "../../../manifest.v3.json";
import style from "./style.module.scss";

export const AppVersion = () => {
  const navigate = useNavigate();
  const { uiConfigStore } = useStore();
  return (
    <HeaderLayout
      showChainName={false}
      showTopMenu={true}
      canChangeChainInfo={false}
      smallTitle={true}
      alternativeTitle={"App Version"}
      onBackButton={() => {
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <div>App version</div>
        <div className={style["version"]}>
          {uiConfigStore.platform == "firefox" ? "None" : manifest.version}
        </div>
      </div>
      <div className={style["hr"]} />
      <div className={style["container"]}>
        <div>Build number</div>
        <div className={style["version"]}>3</div>
      </div>
      <div className={style["hr"]} />
      <div className={style["container"]}>
        <div>Code version</div>
        <div className={style["version"]}>None</div>
      </div>
      <div className={style["hr"]} />
    </HeaderLayout>
  );
};
