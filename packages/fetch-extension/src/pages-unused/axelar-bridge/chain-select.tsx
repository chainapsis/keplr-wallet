import React, { useState } from "react";
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { formatTokenName } from "@utils/format";
interface ChainSelectProps {
  chains: any[];
  recieverChain: any;
  setRecieverChain: any;
  isChainsLoaded: boolean;
  depositAddress: string;
}

export const ChainSelect = observer(
  ({
    chains,
    recieverChain,
    setRecieverChain,
    isChainsLoaded,
    depositAddress,
  }: ChainSelectProps) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { chainStore, analyticsStore } = useStore();
    const handleChainSelect = async (chain: string) => {
      setRecieverChain(chain);
      setDropdownOpen(!dropdownOpen);
      analyticsStore.logEvent("select_chain_click", {
        pageName: "Axelar Bridge",
      });
    };

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className={style["label"]}>To Chain</div>
        <ButtonDropdown
          isOpen={dropdownOpen}
          toggle={() => setDropdownOpen(!dropdownOpen)}
          disabled={!isChainsLoaded || depositAddress?.length > 0}
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
            {!isChainsLoaded ? (
              <React.Fragment>
                loading <i className="fas fa-spinner fa-spin ml-2" />
              </React.Fragment>
            ) : recieverChain ? (
              formatTokenName(recieverChain.chainName)
            ) : (
              "Select network"
            )}
          </DropdownToggle>
          <DropdownMenu style={{ maxHeight: "200px", overflow: "auto" }}>
            {chains.map(
              (chain: any) =>
                chain.chainId &&
                chainStore.current.chainId !== chain.chainId?.toString() && (
                  <DropdownItem
                    key={chain.chainId}
                    onClick={() => handleChainSelect(chain)}
                  >
                    {chain.chainName}
                  </DropdownItem>
                )
            )}
          </DropdownMenu>
        </ButtonDropdown>
      </div>
    );
  }
);
