import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import style from "./style.module.scss";
import { useStore } from "../../stores";

interface TokenSelectProps {
  recieverChain: any;
  depositAddress: string | undefined;
  setTransferToken: any;
  transferToken: any;
  tokens: any[];
}

export const TokenSelect = observer(
  ({
    recieverChain,
    depositAddress,
    setTransferToken,
    transferToken,
    tokens,
  }: TokenSelectProps) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { analyticsStore } = useStore();
    const handleTokenSelect = (token: any) => {
      setTransferToken(token);
      setDropdownOpen(!dropdownOpen);
      analyticsStore.logEvent("select_transfer_token_click", {
        pageName: "Axelar Bridge",
      });
    };

    return (
      <div>
        <div className={style["label"]}>Transfer Token</div>
        <ButtonDropdown
          isOpen={dropdownOpen}
          toggle={() => setDropdownOpen(!dropdownOpen)}
          disabled={!recieverChain || !!depositAddress}
          style={{ width: "150px" }}
        >
          <DropdownToggle
            className={
              depositAddress && depositAddress.length > 0
                ? style["dropdown-toggle"]
                : ""
            }
            style={{ width: "150px" }}
            caret
          >
            {transferToken ? transferToken.assetSymbol : "Select a Token"}
          </DropdownToggle>
          <DropdownMenu style={{ maxHeight: "200px", overflow: "auto" }}>
            {tokens &&
              tokens
                .filter((token) =>
                  recieverChain?.assets.find(
                    (asset: any) => asset.common_key === token.common_key
                  )
                )
                .map((token) => (
                  <DropdownItem
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    key={token.common_key}
                    onClick={() => handleTokenSelect(token)}
                  >
                    {token.assetSymbol}
                  </DropdownItem>
                ))}
          </DropdownMenu>
        </ButtonDropdown>
      </div>
    );
  }
);
