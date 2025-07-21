import React, { FunctionComponent, useState, useMemo } from "react";
import styled from "styled-components";
import { ModularChainInfo } from "@keplr-wallet/types";
import { Box } from "../../../components/box";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { ViewToken } from "../../main";
import { NestedTokenItem } from "./nested-token-item";
import { ToggleItemHeader } from "./toggle-item-header";

interface ChainToggleItemProps {
  modularChainInfo: ModularChainInfo;
  tokens: ViewToken[];
  enabled: boolean;
  disabled?: boolean;
  onToggle: (enable: boolean) => void;
  isNativeChain?: boolean;
}

export const ChainToggleItem: FunctionComponent<ChainToggleItemProps> = ({
  modularChainInfo,
  tokens,
  enabled,
  disabled,
  onToggle,
  isNativeChain = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleHeaderClick = () => {
    if (tokens.length === 0) {
      return;
    }

    setIsOpen(!isOpen);
  };

  const tokenCountText = useMemo(() => `${tokens.length} Tokens`, [tokens]);

  return (
    <div>
      <ToggleItemHeader
        chainInfo={modularChainInfo}
        subtitle={tokenCountText}
        enabled={enabled}
        disabled={disabled}
        isNativeChain={isNativeChain}
        showExpandIcon={true}
        isOpen={isOpen}
        onHeaderClick={handleHeaderClick}
        onToggle={onToggle}
      />

      <VerticalCollapseTransition collapsed={!isOpen}>
        <Styles.ChildrenContainer>
          {tokens.map((token, index) => (
            <Box
              key={`${token.chainInfo.chainId}-${token.token.currency.coinMinimalDenom}`}
              marginBottom={index === tokens.length - 1 ? "1rem" : "none"}
            >
              <NestedTokenItem viewToken={token} />
            </Box>
          ))}
        </Styles.ChildrenContainer>
      </VerticalCollapseTransition>
    </div>
  );
};

const Styles = {
  ChildrenContainer: styled.div`
    background-color: transparent;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
  `,
};
