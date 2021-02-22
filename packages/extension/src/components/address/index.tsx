import React from "react";

import { ToolTip } from "../tooltip";
import { Bech32Address } from "@keplr/cosmos";

export interface AddressProps {
  maxCharacters: number;
  children: string;
  tooltipFontSize?: string;
  tooltipAddress?: string;

  lineBreakBeforePrefix?: boolean;
}

export class Address extends React.Component<AddressProps> {
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
    const { tooltipFontSize, lineBreakBeforePrefix, children } = this.props;

    const tooltipAddress = this.props.tooltipAddress
      ? this.props.tooltipAddress
      : children;

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
  }

  onCopy = async (e: ClipboardEvent) => {
    if (e.clipboardData) {
      // Remove line breaks.
      const pre = await navigator.clipboard.readText();
      await navigator.clipboard.writeText(pre.replace(/(\r\n|\n|\r)/gm, ""));
    }
  };
}
