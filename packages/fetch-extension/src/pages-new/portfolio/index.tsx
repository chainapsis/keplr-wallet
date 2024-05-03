import { HeaderLayout } from "@layouts-v2/header-layout";
import React from "react";
import { useNavigate } from "react-router";
import style from "./style.module.scss";
import { TabsPanel } from "@components-v2/tabs/tabsPanel-2";
import { TokensView } from "../main/tokens";
import { Stats } from "./stats";
import { useStore } from "../../stores";

export const Portfolio = () => {
  const navigate = useNavigate();
  const { chainStore } = useStore();
  const tabs = [
    { id: "Tokens", component: <TokensView /> },
    {
      id: "Stats",
      disabled:
        chainStore.current.chainId !== "fetchhub-4" &&
        chainStore.current.chainId !== "dorado-1",
      component: <Stats />,
    },
  ];
  return (
    <HeaderLayout
      showBottomMenu={true}
      showTopMenu={true}
      onBackButton={() => navigate("/")}
    >
      <div className={style["title"]}>Portfolio</div>
      <TabsPanel tabs={tabs} />
    </HeaderLayout>
  );
};
