import React from "react";

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

export class Address extends React.Component<
  AddressProps & (Bech32AddressProps | RawAddressProps)
> {
  copyRef = React.createRef<HTMLDivElement>();

  componentDidMount(): void {
    if (this.copyRef.current) {
      this.copyRef.current.addEventListener("copy", this.onCopy);
    }
  }

  componentWillUnmount(): void {
    if (this.copyRef.current) {
      this.copyRef.current.removeEventListener("copy", this.onCopy);
    }
  }

  render() {
    const { tooltipFontSize, children } = this.props;
    const tooltipAddress = this.props.tooltipAddress
      ? this.props.tooltipAddress
      : children;

    if ("maxCharacters" in this.props) {
      const { lineBreakBeforePrefix } = this.props;

      return (
        <ToolTip
          trigger="hover"
          options={{ placement: "top" }}
          tooltip={
            <div
              ref={this.copyRef}
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
          {Bech32Address.shortenAddress(children, this.props.maxCharacters)}
        </ToolTip>
      );
    } else {
      return (
        <ToolTip
          trigger="hover"
          options={{ placement: "top" }}
          tooltip={
            <div
              ref={this.copyRef}
              className="address-tooltip"
              style={{ fontSize: tooltipFontSize }}
            >
              {tooltipAddress}
            </div>
          }
        >
          {children}
        </ToolTip>
      );
    }
  }

  onCopy = async (e: ClipboardEvent) => {
    if (e.clipboardData) {
      // Remove line breaks.
      const pre = await navigator.clipboard.readText();
      await navigator.clipboard.writeText(pre.replace(/(\r\n|\n|\r)/gm, ""));
    }
  };
}
