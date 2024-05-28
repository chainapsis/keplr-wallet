import React, { FunctionComponent, useState } from "react";
import { FormGroup } from "reactstrap";
import { Dropdown } from "@components-v2/dropdown";

import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { IIBCChannelConfig } from "@keplr-wallet/hooks";
import { FormattedMessage } from "react-intl";
import { Card } from "@components-v2/card";

export const DestinationChainSelector: FunctionComponent<{
  ibcChannelConfig: IIBCChannelConfig;
  setIsIBCRegisterPageOpen: any;
}> = observer(({ ibcChannelConfig, setIsIBCRegisterPageOpen }) => {
  const { chainStore, ibcChannelStore } = useStore();
  const ibcChannelInfo = ibcChannelStore.get(chainStore.current.chainId);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [selectorId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `destination-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <React.Fragment>
      <FormGroup
        style={{
          marginBottom: "16px",
        }}
      >
        <div className={style["label"]}>
          <FormattedMessage id="component.ibc.channel-registrar.chain-selector.label" />
        </div>
        <button
          type="button"
          id={selectorId}
          className={style["selector"]}
          onClick={() => setIsSelectorOpen(!isSelectorOpen)}
        >
          {ibcChannelConfig.channel ? (
            chainStore.getChain(ibcChannelConfig.channel.counterpartyChainId)
              .chainName
          ) : (
            <div style={{ color: "rgba(255,255,255,0.6)" }}>
              <FormattedMessage id="component.ibc.channel-registrar.chain-selector.placeholder" />
            </div>
          )}
          <img src={require("@assets/svg/wireframe/chevron-down.svg")} alt="" />
        </button>
      </FormGroup>
      <Dropdown
        title="Destination Chain"
        isOpen={isSelectorOpen}
        setIsOpen={setIsSelectorOpen}
        closeClicked={() => setIsSelectorOpen(!isSelectorOpen)}
      >
        {" "}
        <Card
          leftImageStyle={{ backgroundColor: "transparent" }}
          style={{
            height: "69px",
            background: "rgba(255,255,255,0.1)",
            padding: "18px",
            width: "100%",
          }}
          leftImage={<i className="fas fa-plus-circle my-1 mr-1" />}
          heading={
            <FormattedMessage id="component.ibc.channel-registrar.chain-selector.button.add" />
          }
          onClick={(e: any) => {
            e.preventDefault();
            setIsIBCRegisterPageOpen(true);
            setIsSelectorOpen(false);
          }}
        />
        {ibcChannelInfo.getTransferChannels().map((channel) => {
          if (!chainStore.hasChain(channel.counterpartyChainId)) {
            return undefined;
          }

          const chainInfo = chainStore.getChain(channel.counterpartyChainId);

          if (chainInfo) {
            return (
              <Card
                style={{ background: "rgba(255,255,255,0.1)" }}
                heading={chainInfo.chainName}
                key={chainInfo.chainId}
                onClick={(e: any) => {
                  e.preventDefault();
                  ibcChannelConfig.setChannel(channel);
                  setIsSelectorOpen(false);
                }}
                subheading={
                  <div className={style["channel"]}>{channel.channelId}</div>
                }
              />
            );
          }
        })}
      </Dropdown>
    </React.Fragment>
  );
});
