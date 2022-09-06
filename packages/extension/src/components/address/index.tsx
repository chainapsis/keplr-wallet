import React, { FunctionComponent } from "react";

import { ToolTip } from "../tooltip";
import { Bech32Address } from "@keplr-wallet/cosmos";

export interface AddressProps {
  children: string;
  tooltipFontSize?: string;
  tooltipAddress?: string;
}

export interface Bech32AddressProps {
  maxCharacters: number;
  lineBreakBeforePrefix?: boolean;
  isRaw?: false;
}

export interface RawAddressProps {
  isRaw: true;
}

export const Address: FunctionComponent<
  AddressProps & (Bech32AddressProps | RawAddressProps)
> = (props) => {
  const { tooltipFontSize, children } = props;
  const tooltipAddress = props.tooltipAddress ? props.tooltipAddress : children;

  if ("maxCharacters" in props) {
    const { lineBreakBeforePrefix } = props;

    return (
      <ToolTip
        trigger="hover"
        options={{ placement: "top" }}
        tooltip={
          <div
            className="address-tooltip"
            style={{ fontSize: tooltipFontSize }}
          >
            {lineBreakBeforePrefix && tooltipAddress.length > 0
              ? tooltipAddress.split("1").map((item, i) => {
                  if (i === 0) {
                    return <div key={i}>{item + "1"}</div>;
                  }
                  return <div key={i}>{item}</div>;
                })
              : tooltipAddress}
          </div>
        }
      >
        {Bech32Address.shortenAddress(children, props.maxCharacters)}
      </ToolTip>
    );
  }

  return (
    <ToolTip
      trigger="hover"
      options={{ placement: "top" }}
      tooltip={
        <div className="address-tooltip" style={{ fontSize: tooltipFontSize }}>
          {tooltipAddress}
        </div>
      }
    >
      {children}
    </ToolTip>
  );
};
