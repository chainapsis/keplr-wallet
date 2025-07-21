import React, { FunctionComponent, useMemo } from "react";
import { ModularChainInfo } from "@keplr-wallet/types";
import { ToggleItemHeader } from "./toggle-item-header";
import { ColorPalette } from "../../../styles";
import { useTheme } from "styled-components";
import { NativeChainSectionIconLM } from "../../register/enable-chains/components/native-chain-section-icon-lm";
import { NativeChainSectionIconDM } from "../../register/enable-chains/components/native-chain-section-icon-dm";
import { useStore } from "../../../stores";

interface AllNativeToggleItemProps {
  nativeChainInfos: ModularChainInfo[];
  nativeChainIdentifierSet: Set<string>;
  onToggleAll: (enable: boolean) => void;
}

export const AllNativeToggleItem: FunctionComponent<
  AllNativeToggleItemProps
> = ({ nativeChainInfos, nativeChainIdentifierSet, onToggleAll }) => {
  const { chainStore } = useStore();
  const theme = useTheme();
  const allEnabled = useMemo(() => {
    for (const id of nativeChainIdentifierSet) {
      if (!chainStore.isEnabledChain(id)) return false;
    }
    return true;
  }, [nativeChainIdentifierSet, chainStore]);

  if (nativeChainInfos.length === 0) {
    return null;
  }

  const imageChainInfo = nativeChainInfos[0];

  const iconElement = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "1000000px",
        background:
          theme.mode === "light"
            ? "rgba(220, 220, 227, 0.50)"
            : "linear-gradient(180deg, #323A6B 0%, #1A1B41 100%)",
      }}
    >
      {theme.mode === "light" ? (
        <NativeChainSectionIconLM size={"1.1666875rem"} />
      ) : (
        <NativeChainSectionIconDM size={"1.1666875rem"} />
      )}
    </div>
  );

  return (
    <ToggleItemHeader
      chainInfo={imageChainInfo}
      title="All Native Chains"
      subtitle={"Cosmos, Ethereum, Bitcoin..."}
      enabled={allEnabled}
      isNativeChain={true}
      onToggle={onToggleAll}
      disabled={false}
      showExpandIcon={false}
      onHeaderClick={() => onToggleAll(!allEnabled)}
      hideStackIcon={true}
      iconElement={iconElement}
      style={{
        border: `0.09375rem solid ${
          ColorPalette[theme.mode === "light" ? "blue-200" : "blue-600"]
        }`,
      }}
    />
  );
};
