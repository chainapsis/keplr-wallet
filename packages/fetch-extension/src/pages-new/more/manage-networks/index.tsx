import { Card } from "@components-v2/card";
import { SearchBar } from "@components-v2/search-bar";
import { TabsPanel } from "@components-v2/tabs/tabsPanel-2";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import { ToggleSwitchButton } from "@components-v2/buttons/toggle-switch-button";
import { ButtonV2 } from "@components-v2/buttons/button";
import { getFilteredChainValues } from "@utils/filters";

export const ManageNetworks: FunctionComponent = observer(() => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { chainStore } = useStore();

  const [cosmosSearchTerm, setCosmosSearchTerm] = useState("");
  const [evmSearchTerm, setEvmSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("Cosmos");

  const mainChainList = chainStore.chainInfos.filter(
    (chainInfo) => !chainInfo.beta && !chainInfo.features?.includes("evm")
  );

  const evmChainList = chainStore.chainInfos.filter((chainInfo) =>
    chainInfo.features?.includes("evm")
  );

  const disabledChainList = chainStore.disabledChainInfosInUI;

  const tabs = [
    {
      id: "Cosmos",
      component: (
        <div>
          <SearchBar
            onSearchTermChange={setCosmosSearchTerm}
            searchTerm={cosmosSearchTerm}
            valuesArray={mainChainList}
            filterFunction={getFilteredChainValues}
            itemsStyleProp={{ overflow: "auto", height: "360px" }}
            renderResult={(chainInfo, index) => (
              <Card
                key={index}
                leftImage={
                  chainInfo.raw.chainSymbolImageUrl !== undefined
                    ? chainInfo.raw.chainSymbolImageUrl
                    : chainInfo.chainName
                    ? chainInfo.chainName[0].toUpperCase()
                    : ""
                }
                heading={chainInfo.chainName}
                rightContent={
                  <ToggleSwitchButton
                    checked={!disabledChainList.includes(chainInfo)}
                    onChange={() => {
                      chainStore.toggleChainInfoInUI(chainInfo.chainId);
                    }}
                  />
                }
              />
            )}
          />
        </div>
      ),
    },
    {
      id: "EVM",
      component: (
        <div>
          <SearchBar
            searchTerm={evmSearchTerm}
            onSearchTermChange={setEvmSearchTerm}
            valuesArray={evmChainList}
            filterFunction={getFilteredChainValues}
            renderResult={(chainInfo, index) => (
              <Card
                key={index}
                leftImage={
                  chainInfo.raw.chainSymbolImageUrl !== undefined
                    ? chainInfo.raw.chainSymbolImageUrl
                    : chainInfo.chainName
                    ? chainInfo.chainName[0].toUpperCase()
                    : ""
                }
                heading={chainInfo.chainName}
                rightContent={
                  <ToggleSwitchButton
                    checked={!disabledChainList.includes(chainInfo)}
                    onChange={() => {
                      chainStore.toggleChainInfoInUI(chainInfo.chainId);
                    }}
                  />
                }
              />
            )}
          />
          <div style={{ width: "100%" }}>
            <ButtonV2
              styleProps={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "white",
                height: "48px",
                fontSize: "14px",
                fontWeight: 400,
              }}
              onClick={(e: any) => {
                e.preventDefault();
                navigate("/setting/addEvmChain");
              }}
              gradientText={""}
              text={"Add custom EVM network"}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <HeaderLayout
      smallTitle={true}
      showTopMenu={true}
      showChainName={false}
      showBottomMenu={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id:
          selectedTab === "EVM"
            ? "chain.manage-networks.evm"
            : "chain.manage-networks.cosmos",
      })}
      onBackButton={() => {
        navigate("/");
      }}
    >
      <div className={style["chainListContainer"]}>
        <TabsPanel onTabChange={setSelectedTab} tabs={tabs} />
      </div>
    </HeaderLayout>
  );
});
