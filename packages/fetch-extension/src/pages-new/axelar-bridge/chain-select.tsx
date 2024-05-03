import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Card } from "@components-v2/card";
import { Dropdown } from "@components-v2/dropdown";

interface ChainSelectProps {
  chains: any[];
  recieverChain: any;
  setRecieverChain: any;
  isChainsLoaded: boolean;
  depositAddress: string;
  setRecipientAddress: any;
}

export const ChainSelect = observer(
  ({
    chains,
    recieverChain,
    setRecieverChain,
    isChainsLoaded,
    depositAddress,
    setRecipientAddress,
  }: ChainSelectProps) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { chainStore, accountStore } = useStore();

    const handleChainSelect = async (chain: string) => {
      setRecieverChain(chain);
      setDropdownOpen(false);
    };

    return (
      <div>
        <Card
          heading={
            !isChainsLoaded ? (
              <React.Fragment>
                loading <i className="fas fa-spinner fa-spin ml-2" />
              </React.Fragment>
            ) : recieverChain ? (
              recieverChain.chainName
            ) : (
              "Transfer To"
            )
          }
          rightContent={require("@assets/svg/wireframe/chevron-down.svg")}
          style={{
            height: "72px",
            background: "rgba(255,255,255,0.1)",
          }}
          onClick={() => !depositAddress && setDropdownOpen(true)}
        />

        <Dropdown
          isOpen={dropdownOpen}
          setIsOpen={setDropdownOpen}
          title={"Transfer to"}
          closeClicked={() => setDropdownOpen(false)}
        >
          {chains.map(
            (chain: any) =>
              chain.chainId &&
              chainStore.current.chainId !== chain.chainId?.toString() && (
                <Card
                  heading={chain.chainName}
                  key={chain.chainId}
                  onClick={() => {
                    handleChainSelect(chain);
                    setRecipientAddress(
                      accountStore.getAccount(chain.chainId).bech32Address
                    );
                  }}
                  subheading={
                    accountStore.getAccount(chain.chainId.toString())
                      .bech32Address
                  }
                />
              )
          )}
        </Dropdown>
      </div>
    );
  }
);
