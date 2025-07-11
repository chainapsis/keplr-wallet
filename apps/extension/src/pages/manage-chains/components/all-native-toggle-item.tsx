import React, { FunctionComponent, useMemo } from "react";
import { ModularChainInfo } from "@keplr-wallet/types";
import { ToggleItemHeader } from "./toggle-item-header";

interface AllNativeToggleItemProps {
  nativeChainInfos: ModularChainInfo[];
  nativeChainIdentifierSet: Set<string>;
  enabledIdentifierMap: Map<string, boolean>;
  onToggleAll: (enable: boolean) => void;
}

export const AllNativeToggleItem: FunctionComponent<
  AllNativeToggleItemProps
> = ({
  nativeChainInfos,
  nativeChainIdentifierSet,
  enabledIdentifierMap,
  onToggleAll,
}) => {
  const allEnabled = useMemo(() => {
    for (const id of nativeChainIdentifierSet) {
      if (!enabledIdentifierMap.get(id)) return false;
    }
    return true;
  }, [nativeChainIdentifierSet, enabledIdentifierMap]);

  if (nativeChainInfos.length === 0) {
    return null;
  }

  const imageChainInfo = nativeChainInfos[0];

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
    />
  );
};
